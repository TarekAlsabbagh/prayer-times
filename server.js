const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');
const Terser   = require('terser');
const CleanCSS = require('clean-css');

// ===== معالجات أخطاء العملية (تمنع السقوط الكلي عند خطأ واحد) =====
process.on('uncaughtException', (err) => {
    console.error('[FATAL uncaughtException]', err && err.stack || err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL unhandledRejection]', reason && reason.stack || reason);
});

const PORT    = process.env.PORT || 8080;
const ROOT    = __dirname;
const DB_DIR  = path.join(ROOT, 'db');   // قاعدة البيانات الدائمة

// ===== المصدر الموحد للدومين =====
// في الإنتاج: SITE_URL=https://example.com node server.js
// محلياً: يُستخدم http://localhost:PORT تلقائياً
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
function getBaseUrl() { return SITE_URL; }

// ===== خريطة أسماء الدول بالإنجليزية (لتوليد slugs للـ sitemap) =====
const COUNTRY_NAMES_EN = {
    sa:'Saudi Arabia', sy:'Syria', eg:'Egypt', iq:'Iraq',
    jo:'Jordan', lb:'Lebanon', ps:'Palestine', kw:'Kuwait', ae:'United Arab Emirates',
    qa:'Qatar', bh:'Bahrain', om:'Oman', ye:'Yemen', ly:'Libya',
    tn:'Tunisia', dz:'Algeria', ma:'Morocco', sd:'Sudan',
    dj:'Djibouti', km:'Comoros',
    pk:'Pakistan', tr:'Turkey', ir:'Iran', id:'Indonesia', my:'Malaysia',
    bd:'Bangladesh', af:'Afghanistan', in:'India', lk:'Sri Lanka', np:'Nepal',
    cn:'China', jp:'Japan', kr:'South Korea', kp:'North Korea', mn:'Mongolia',
    fr:'France', de:'Germany', gb:'United Kingdom', es:'Spain', it:'Italy',
    nl:'Netherlands', be:'Belgium', pt:'Portugal', se:'Sweden', no:'Norway',
    dk:'Denmark', fi:'Finland', pl:'Poland', ru:'Russia', ua:'Ukraine',
    ch:'Switzerland', at:'Austria', gr:'Greece', cz:'Czech Republic', ro:'Romania',
    us:'United States', ca:'Canada', mx:'Mexico',
    gt:'Guatemala', cu:'Cuba', do:'Dominican Republic',
    br:'Brazil', ar:'Argentina', co:'Colombia', pe:'Peru', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania', za:'South Africa',
    gh:'Ghana', sn:'Senegal', cm:'Cameroon', ml:'Mali', so:'Somalia',
    ug:'Uganda', mr:'Mauritania', td:'Chad', ne:'Niger',
    au:'Australia', nz:'New Zealand',
    th:'Thailand', ph:'Philippines', vn:'Vietnam', mm:'Myanmar',
    kh:'Cambodia', la:'Laos', sg:'Singapore', bn:'Brunei', tl:'Timor-Leste',
    uz:'Uzbekistan', kz:'Kazakhstan', kg:'Kyrgyzstan', tj:'Tajikistan',
    tm:'Turkmenistan', az:'Azerbaijan', ge:'Georgia', am:'Armenia',
    xk:'Kosovo',
    // Round 7k — توسّع: 40 دولة إضافية (105 → 145)
    ba:'Bosnia and Herzegovina', al:'Albania', mk:'North Macedonia',
    bf:'Burkina Faso', ci:"Côte d'Ivoire", gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Maldives', er:'Eritrea', ss:'South Sudan',
    tg:'Togo', bj:'Benin',
    ie:'Ireland', hu:'Hungary', hr:'Croatia', rs:'Serbia',
    bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'DR Congo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad and Tobago', jm:'Jamaica',
    pa:'Panama', ht:'Haiti', cr:'Costa Rica',
    bt:'Bhutan', fj:'Fiji', pg:'Papua New Guinea',
    // Microstates / city-states (country slug often collides with capital — handled via "-city" suffix)
    mc:'Monaco', sm:'San Marino', va:'Vatican City', ad:'Andorra',
    li:'Liechtenstein', lu:'Luxembourg', mt:'Malta',
};

function makeCountrySlugSrv(cc) {
    const name = COUNTRY_NAMES_EN[cc];
    if (name) return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return cc;
}

// ===== Cache الـ sitemap (30 دقيقة TTL) =====
let _sitemapCache = { data: null, time: 0 };
const SITEMAP_TTL = 30 * 60 * 1000;
function invalidateSitemapCache() { _sitemapCache = { data: null, time: 0 }; }
function makeCitySlugSrv(nameEn, lat, lng) {
    const latin = (nameEn || '').toLowerCase().replace(/[^a-z0-9\s]+/g, '').trim().replace(/\s+/g, '-');
    if (latin.length >= 2) return latin;
    const la = Math.abs(lat).toFixed(1) + (lat >= 0 ? 'n' : 's');
    const lo = Math.abs(lng).toFixed(1) + (lng >= 0 ? 'e' : 'w');
    return `${la}-${lo}`;
}

// كاش في الذاكرة لطلبات Nominatim (يمنع تكرار الطلبات ويتجنب rate limit)
// LRU محدود (10K مدخل) لمنع النمو اللانهائي تحت حمل كبير
const _GEOCACHE_MAX = 10000;
const _GEOCACHE_TTL = 24 * 60 * 60 * 1000; // 24 ساعة
const _geocodeCache = {
    _m: new Map(),
    get(k) {
        const v = this._m.get(k);
        if (v === undefined) return undefined;
        // LRU: إعادة الإدراج تنقل المفتاح إلى النهاية (الأحدث استخداماً)
        this._m.delete(k);
        this._m.set(k, v);
        return v;
    },
    set(k, v) {
        if (this._m.has(k)) this._m.delete(k);
        this._m.set(k, v);
        // طرد الأقدم (أول مفتاح في Map) عند تجاوز الحد
        while (this._m.size > _GEOCACHE_MAX) {
            const firstKey = this._m.keys().next().value;
            this._m.delete(firstKey);
        }
    }
};

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// ===== كاش الملفات الثابتة في الذاكرة =====
// عند الإقلاع، نحمّل أهم الملفات ونسختها المضغوطة إلى الذاكرة
// فلا نقرأ القرص ولا نضغط gzip في كل طلب
const _staticCache = new Map(); // fullPath → { data, gzipped, brotli }
// CSS المُصغَّر يُحفظ كنص للـ inline في HTML (يُزيل render-blocking request)
let _inlineCssText = '';
const _preloadPaths = [
    'css/style.css',
    'js/app.js', 'js/i18n.js', 'js/footer-cookie.js',
    'js/duas.js', 'js/hijri-date.js', 'js/prayer-times.js', 'js/moon.js', 'js/qibla.js',
    'index.html', 'prayer-times-cities.html', 'legal.html', 'countries.html',
    'sw.js',
];

// Preload + minify + compress async (terser is Promise-based)
// server.listen() awaits this via _preloadReady
const _cleanCss = new CleanCSS({ returnPromise: false, level: 2 });
async function _preloadStatic() {
    const _t0 = Date.now();
    let minSavings = 0;
    for (const rel of _preloadPaths) {
        try {
            const full = path.join(ROOT, rel);
            let data = fs.readFileSync(full);
            const originalSize = data.length;
            const ext = path.extname(rel).toLowerCase();
            try {
                if (ext === '.js') {
                    const src = data.toString('utf8');
                    const result = await Terser.minify(src, { compress: true, mangle: true });
                    if (result && result.code) data = Buffer.from(result.code, 'utf8');
                } else if (ext === '.css') {
                    const src = data.toString('utf8');
                    const result = _cleanCss.minify(src);
                    if (result && result.styles) {
                        data = Buffer.from(result.styles, 'utf8');
                        // حفظ النص لاستخدامه inline في HTML
                        if (rel === 'css/style.css') _inlineCssText = result.styles;
                    }
                }
            } catch (me) {
                console.warn(`[Minify] Skipped ${rel}: ${me.message}`);
            }
            minSavings += (originalSize - data.length);
            let gzipped = null, brotli = null;
            try { gzipped = zlib.gzipSync(data); } catch(e) {}
            try { brotli = zlib.brotliCompressSync(data, {
                params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } // أقصى ضغط — مرة واحدة عند الإقلاع فقط
            }); } catch(e) {}
            _staticCache.set(full, { data, gzipped, brotli });
        } catch(e) { /* الملف قد لا يكون موجوداً، تجاهل */ }
    }
    const _dt = Date.now() - _t0;
    console.log(`[Cache] Preloaded ${_staticCache.size} files in ${_dt}ms — minified (saved ${(minSavings/1024).toFixed(1)} KB) + gzip + brotli`);
}
const _preloadReady = _preloadStatic();

// مساعد يقرأ من الكاش أولاً، وإلا يعود للقرص
// يُستخدم لتقديم index.html و prayer-times-cities.html بسرعة من الذاكرة
function readCachedFile(fullPath, cb) {
    const cached = _staticCache.get(fullPath);
    if (cached) return setImmediate(() => cb(null, cached.data));
    fs.readFile(fullPath, cb);
}

// ============================================================
// ===== LEGAL PAGES CONTENT (bilingual AR + EN) ===============
// ============================================================
const LEGAL_PAGES = {
    'privacy': {
        ar: `<h1>سياسة الخصوصية</h1>
<span class="legal-meta">آخر تحديث: ${new Date().toISOString().split('T')[0]}</span>
<p>نحن في موقع <strong>مواقيت الصلاة</strong> نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة طبيعة المعلومات التي نجمعها وطريقة استخدامها.</p>
<h2>1. البيانات التي نجمعها</h2>
<p>نحن لا نطلب التسجيل ولا نخزّن بيانات شخصية على خوادمنا. تقتصر البيانات التي قد نتعامل معها على:</p>
<ul>
<li><strong>الموقع الجغرافي:</strong> يُستخدم لحساب مواقيت الصلاة واتجاه القبلة بدقة. يبقى الإذن اختيارياً، وتُخزَّن إحداثياتك محلياً في متصفحك فقط (localStorage).</li>
<li><strong>تفضيلات اللغة والإعدادات:</strong> تُخزَّن في المتصفح للحفاظ على تجربة موحدة عبر الزيارات.</li>
<li><strong>سجلات الخادم الفنية:</strong> تتضمن عنوان IP، نوع المتصفح، الصفحات المزارة، لأغراض الأمان والتحليلات المجمّعة فقط.</li>
</ul>
<h2>2. ملفات تعريف الارتباط (Cookies)</h2>
<p>نستخدم نوعين من ملفات تعريف الارتباط:</p>
<ul>
<li><strong>أساسية:</strong> ضرورية لعمل الموقع (تخزين اللغة، الموقع، إعدادات التذكير).</li>
<li><strong>إعلانية:</strong> عند تفعيل خدمة Google AdSense، قد تستخدم Google ملفات ارتباط لعرض إعلانات مخصّصة. يمكنك التحكم فيها عبر <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">إعدادات إعلانات Google</a>.</li>
</ul>
<h2>3. الخدمات الخارجية</h2>
<p>يستخدم الموقع الخدمات التالية لتوفير تجربة كاملة:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> للبحث عن المدن وتحويل الإحداثيات إلى أسماء مواقع.</li>
<li><strong>ويكيبيديا API:</strong> لجلب معلومات تاريخية ومدنية ضمن صفحات "عن المدينة".</li>
<li><strong>Google Fonts:</strong> لتحميل خط Cairo العربي.</li>
<li><strong>Google AdSense (اختياري):</strong> لعرض إعلانات تساعد في تشغيل الموقع مجاناً.</li>
</ul>
<h2>4. حقوقك</h2>
<p>لك الحق في:</p>
<ul>
<li>رفض إذن الموقع الجغرافي دون أن يتأثر تصفّحك للموقع.</li>
<li>مسح بيانات الموقع المخزّنة محلياً عبر إعدادات المتصفح.</li>
<li>تعطيل الإعلانات المخصّصة عبر إعدادات Google.</li>
<li>طلب أي معلومة إضافية عبر <a href="/contact">صفحة الاتصال</a>.</li>
</ul>
<h2>5. الأطفال</h2>
<p>الموقع مفتوح للجميع ولا يستهدف الأطفال دون 13 سنة بشكل خاص. لا نجمع أي بيانات شخصية من المستخدمين عمداً.</p>
<h2>6. تعديلات السياسة</h2>
<p>قد نُحدّث هذه السياسة دورياً. سيُعرض تاريخ آخر تحديث في أعلى الصفحة. الاستمرار في استخدام الموقع بعد التعديل يعني الموافقة على النسخة المحدّثة.</p>
<h2>7. التواصل</h2>
<p>لأي استفسار يخصّ هذه السياسة، يُرجى زيارة <a href="/contact">صفحة الاتصال</a>.</p>`,
        en: `<h1>Privacy Policy</h1>
<span class="legal-meta">Last updated: ${new Date().toISOString().split('T')[0]}</span>
<p>At <strong>Prayer Times</strong>, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect and how we use it.</p>
<h2>1. Data We Collect</h2>
<p>We do not require registration and do not store personal data on our servers. The information we may handle is limited to:</p>
<ul>
<li><strong>Geographic location:</strong> Used to calculate accurate prayer times and Qibla direction. Permission is optional, and your coordinates are stored only locally in your browser (localStorage).</li>
<li><strong>Language and preferences:</strong> Stored in your browser to provide a consistent experience across visits.</li>
<li><strong>Technical server logs:</strong> Include IP address, browser type, and visited pages, used for security and aggregated analytics only.</li>
</ul>
<h2>2. Cookies</h2>
<p>We use two types of cookies:</p>
<ul>
<li><strong>Essential:</strong> Necessary for site operation (storing language, location, reminder settings).</li>
<li><strong>Advertising:</strong> When Google AdSense is enabled, Google may use cookies to display personalized ads. You can manage these through <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.</li>
</ul>
<h2>3. Third-Party Services</h2>
<p>The site uses the following services to provide a complete experience:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> for city search and reverse geocoding.</li>
<li><strong>Wikipedia API:</strong> to fetch historical and city information on About pages.</li>
<li><strong>Google Fonts:</strong> for loading the Cairo Arabic font.</li>
<li><strong>Google AdSense (optional):</strong> to display ads that help keep the site free.</li>
</ul>
<h2>4. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Decline location permission without affecting your browsing.</li>
<li>Clear locally stored site data via your browser settings.</li>
<li>Disable personalized ads through Google settings.</li>
<li>Request additional information via our <a href="/en/contact">Contact page</a>.</li>
</ul>
<h2>5. Children</h2>
<p>The site is open to everyone and is not specifically targeted at children under 13. We do not knowingly collect personal data from any user.</p>
<h2>6. Policy Updates</h2>
<p>We may update this policy periodically. The last update date will appear at the top of the page. Continued use of the site after changes means acceptance of the updated version.</p>
<h2>7. Contact</h2>
<p>For any questions about this policy, please visit our <a href="/en/contact">Contact page</a>.</p>`,
        fr: `<h1>Politique de confidentialité</h1>
<span class="legal-meta">Dernière mise à jour : ${new Date().toISOString().split('T')[0]}</span>
<p>Sur <strong>Heures de Prière</strong>, nous respectons votre vie privée et nous engageons à protéger vos données personnelles. Cette politique explique quelles informations nous collectons et comment nous les utilisons.</p>
<h2>1. Données que nous collectons</h2>
<p>Nous n'exigeons aucune inscription et ne stockons aucune donnée personnelle sur nos serveurs. Les informations éventuellement traitées se limitent à :</p>
<ul>
<li><strong>Localisation géographique :</strong> utilisée pour calculer avec précision les heures de prière et la direction de la Qibla. L'autorisation est facultative et vos coordonnées sont stockées uniquement localement dans votre navigateur (localStorage).</li>
<li><strong>Langue et préférences :</strong> stockées dans votre navigateur pour une expérience cohérente d'une visite à l'autre.</li>
<li><strong>Journaux techniques du serveur :</strong> incluent l'adresse IP, le type de navigateur et les pages visitées, utilisés uniquement pour la sécurité et les statistiques agrégées.</li>
</ul>
<h2>2. Cookies</h2>
<p>Nous utilisons deux types de cookies :</p>
<ul>
<li><strong>Essentiels :</strong> nécessaires au fonctionnement du site (stockage de la langue, de la localisation, des paramètres de rappel).</li>
<li><strong>Publicitaires :</strong> lorsque Google AdSense est activé, Google peut utiliser des cookies pour afficher des publicités personnalisées. Vous pouvez les gérer via les <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">paramètres des annonces Google</a>.</li>
</ul>
<h2>3. Services tiers</h2>
<p>Le site utilise les services suivants pour offrir une expérience complète :</p>
<ul>
<li><strong>OpenStreetMap Nominatim :</strong> pour la recherche de villes et le géocodage inversé.</li>
<li><strong>API Wikipédia :</strong> pour récupérer des informations historiques et municipales sur les pages « À propos ».</li>
<li><strong>Google Fonts :</strong> pour charger la police arabe Cairo.</li>
<li><strong>Google AdSense (facultatif) :</strong> pour afficher des publicités qui aident à maintenir le site gratuit.</li>
</ul>
<h2>4. Vos droits</h2>
<p>Vous avez le droit de :</p>
<ul>
<li>Refuser l'autorisation de localisation sans que cela n'affecte votre navigation.</li>
<li>Effacer les données du site stockées localement via les paramètres de votre navigateur.</li>
<li>Désactiver les publicités personnalisées via les paramètres Google.</li>
<li>Demander toute information supplémentaire via notre <a href="/fr/contact">page Contact</a>.</li>
</ul>
<h2>5. Enfants</h2>
<p>Le site est ouvert à tous et ne cible pas spécifiquement les enfants de moins de 13 ans. Nous ne collectons sciemment aucune donnée personnelle auprès des utilisateurs.</p>
<h2>6. Mises à jour de la politique</h2>
<p>Nous pouvons mettre à jour cette politique périodiquement. La date de dernière mise à jour apparaîtra en haut de la page. La poursuite de l'utilisation du site après modification implique l'acceptation de la version mise à jour.</p>
<h2>7. Contact</h2>
<p>Pour toute question concernant cette politique, veuillez consulter notre <a href="/fr/contact">page Contact</a>.</p>`,
        tr: `<h1>Gizlilik Politikası</h1>
<span class="legal-meta">Son güncelleme: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>Namaz Vakitleri</strong> olarak gizliliğinize saygı duyar ve kişisel verilerinizi korumayı taahhüt ederiz. Bu politika, hangi bilgileri topladığımızı ve nasıl kullandığımızı açıklar.</p>
<h2>1. Topladığımız Veriler</h2>
<p>Kayıt gerektirmeyiz ve sunucularımızda kişisel veri saklamayız. İşleyebileceğimiz bilgiler şunlarla sınırlıdır:</p>
<ul>
<li><strong>Coğrafi konum:</strong> Namaz vakitlerini ve Kıble yönünü doğru hesaplamak için kullanılır. İzin isteğe bağlıdır ve koordinatlarınız yalnızca tarayıcınızda yerel olarak saklanır (localStorage).</li>
<li><strong>Dil ve tercihler:</strong> Ziyaretler arası tutarlı bir deneyim için tarayıcınızda saklanır.</li>
<li><strong>Teknik sunucu kayıtları:</strong> IP adresi, tarayıcı türü ve ziyaret edilen sayfaları içerir; yalnızca güvenlik ve toplu analitik için kullanılır.</li>
</ul>
<h2>2. Çerezler</h2>
<p>İki tür çerez kullanıyoruz:</p>
<ul>
<li><strong>Temel:</strong> Sitenin çalışması için gerekli (dil, konum, hatırlatıcı ayarları).</li>
<li><strong>Reklam:</strong> Google AdSense etkinleştirildiğinde, Google kişiselleştirilmiş reklamlar göstermek için çerez kullanabilir. Bunları <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Reklam Ayarları</a> üzerinden yönetebilirsiniz.</li>
</ul>
<h2>3. Üçüncü Taraf Hizmetler</h2>
<p>Site, tam bir deneyim sunmak için aşağıdaki hizmetleri kullanır:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> şehir arama ve ters jeokodlama için.</li>
<li><strong>Wikipedia API:</strong> "Şehir Hakkında" sayfalarında tarihi ve şehir bilgilerini almak için.</li>
<li><strong>Google Fonts:</strong> Cairo Arapça yazı tipini yüklemek için.</li>
<li><strong>Google AdSense (isteğe bağlı):</strong> siteyi ücretsiz tutmaya yardımcı reklamları göstermek için.</li>
</ul>
<h2>4. Haklarınız</h2>
<p>Şu haklara sahipsiniz:</p>
<ul>
<li>Taramanızı etkilemeden konum iznini reddetmek.</li>
<li>Yerel olarak saklanan site verilerini tarayıcı ayarlarınızdan silmek.</li>
<li>Google ayarlarından kişiselleştirilmiş reklamları devre dışı bırakmak.</li>
<li><a href="/tr/contact">İletişim sayfamız</a> aracılığıyla ek bilgi talep etmek.</li>
</ul>
<h2>5. Çocuklar</h2>
<p>Site herkese açıktır ve özellikle 13 yaş altı çocukları hedeflemez. Hiçbir kullanıcıdan bilerek kişisel veri toplamıyoruz.</p>
<h2>6. Politika Güncellemeleri</h2>
<p>Bu politikayı periyodik olarak güncelleyebiliriz. Son güncelleme tarihi sayfanın üst kısmında görünecektir. Değişikliklerden sonra sitenin kullanılmaya devam edilmesi güncel sürümün kabul edildiği anlamına gelir.</p>
<h2>7. İletişim</h2>
<p>Bu politika hakkında sorularınız için lütfen <a href="/tr/contact">İletişim sayfamıza</a> bakın.</p>`,
        ur: `<h1>پرائیویسی پالیسی</h1>
<span class="legal-meta">آخری تازہ کاری: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>اوقاتِ نماز</strong> پر ہم آپ کی پرائیویسی کا احترام کرتے ہیں اور آپ کے ذاتی ڈیٹا کی حفاظت کے پابند ہیں۔ یہ پالیسی واضح کرتی ہے کہ ہم کون سی معلومات جمع کرتے ہیں اور انہیں کیسے استعمال کرتے ہیں۔</p>
<h2>1. جو ڈیٹا ہم جمع کرتے ہیں</h2>
<p>ہم رجسٹریشن کا مطالبہ نہیں کرتے اور اپنے سرورز پر کوئی ذاتی ڈیٹا محفوظ نہیں کرتے۔ جو معلومات ہم ہینڈل کر سکتے ہیں وہ محدود ہیں:</p>
<ul>
<li><strong>جغرافیائی مقام:</strong> نماز کے درست اوقات اور قبلہ کی سمت حساب کرنے کے لیے استعمال ہوتا ہے۔ اجازت اختیاری ہے، اور آپ کے کوآرڈینیٹس صرف آپ کے براؤزر میں مقامی طور پر محفوظ ہوتے ہیں (localStorage)۔</li>
<li><strong>زبان اور ترجیحات:</strong> وزٹس کے دوران یکساں تجربے کے لیے آپ کے براؤزر میں محفوظ۔</li>
<li><strong>تکنیکی سرور لاگز:</strong> IP ایڈریس، براؤزر کی قسم، اور دیکھے گئے صفحات شامل ہیں، صرف سیکیورٹی اور مجموعی تجزیات کے لیے۔</li>
</ul>
<h2>2. کوکیز</h2>
<p>ہم دو قسم کی کوکیز استعمال کرتے ہیں:</p>
<ul>
<li><strong>ضروری:</strong> سائٹ کے کام کرنے کے لیے لازمی (زبان، مقام، یاد دہانی کی ترتیبات محفوظ کرنا)۔</li>
<li><strong>اشتہاری:</strong> جب Google AdSense فعال ہو تو Google ذاتی نوعیت کے اشتہارات دکھانے کے لیے کوکیز استعمال کر سکتا ہے۔ آپ <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google ایڈ سیٹنگز</a> کے ذریعے انہیں کنٹرول کر سکتے ہیں۔</li>
</ul>
<h2>3. تیسرے فریق کی خدمات</h2>
<p>مکمل تجربہ فراہم کرنے کے لیے سائٹ مندرجہ ذیل خدمات استعمال کرتی ہے:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> شہروں کی تلاش اور الٹی جیوکوڈنگ کے لیے۔</li>
<li><strong>Wikipedia API:</strong> "شہر کے بارے میں" صفحات پر تاریخی اور شہری معلومات حاصل کرنے کے لیے۔</li>
<li><strong>Google Fonts:</strong> Cairo عربی فونٹ لوڈ کرنے کے لیے۔</li>
<li><strong>Google AdSense (اختیاری):</strong> سائٹ کو مفت رکھنے میں مدد کرنے والے اشتہارات دکھانے کے لیے۔</li>
</ul>
<h2>4. آپ کے حقوق</h2>
<p>آپ کو یہ حق حاصل ہے کہ:</p>
<ul>
<li>براؤزنگ کو متاثر کیے بغیر مقام کی اجازت سے انکار کریں۔</li>
<li>اپنی براؤزر کی ترتیبات کے ذریعے مقامی طور پر محفوظ ڈیٹا صاف کریں۔</li>
<li>Google کی ترتیبات کے ذریعے ذاتی اشتہارات بند کریں۔</li>
<li>ہمارے <a href="/ur/contact">رابطہ صفحہ</a> کے ذریعے اضافی معلومات طلب کریں۔</li>
</ul>
<h2>5. بچے</h2>
<p>سائٹ سب کے لیے کھلی ہے اور خاص طور پر 13 سال سے کم عمر کے بچوں کو نشانہ نہیں بناتی۔ ہم جان بوجھ کر کسی صارف سے ذاتی ڈیٹا جمع نہیں کرتے۔</p>
<h2>6. پالیسی اپ ڈیٹس</h2>
<p>ہم اس پالیسی کو وقتاً فوقتاً اپ ڈیٹ کر سکتے ہیں۔ آخری اپ ڈیٹ کی تاریخ صفحے کے اوپر ظاہر ہوگی۔ تبدیلیوں کے بعد سائٹ کا مسلسل استعمال اپ ڈیٹڈ ورژن کی قبولیت کا مطلب ہے۔</p>
<h2>7. رابطہ</h2>
<p>اس پالیسی سے متعلق کسی بھی سوال کے لیے، براہ کرم ہمارے <a href="/ur/contact">رابطہ صفحے</a> پر جائیں۔</p>`,
        de: `<h1>Datenschutzerklärung</h1>
<span class="legal-meta">Zuletzt aktualisiert: ${new Date().toISOString().split('T')[0]}</span>
<p>Bei <strong>Gebetszeiten</strong> respektieren wir Ihre Privatsphäre und verpflichten uns zum Schutz Ihrer persönlichen Daten. Diese Erklärung beschreibt, welche Informationen wir erheben und wie wir sie verwenden.</p>
<h2>1. Von uns erhobene Daten</h2>
<p>Wir verlangen keine Registrierung und speichern keine personenbezogenen Daten auf unseren Servern. Die von uns verarbeiteten Informationen beschränken sich auf:</p>
<ul>
<li><strong>Geografischer Standort:</strong> Wird verwendet, um präzise Gebetszeiten und die Qibla-Richtung zu berechnen. Die Erlaubnis ist optional, und Ihre Koordinaten werden ausschließlich lokal in Ihrem Browser gespeichert (localStorage).</li>
<li><strong>Sprache und Einstellungen:</strong> In Ihrem Browser gespeichert, um ein konsistentes Erlebnis über mehrere Besuche zu gewährleisten.</li>
<li><strong>Technische Server-Logs:</strong> Umfassen IP-Adresse, Browser-Typ und besuchte Seiten; werden nur zu Sicherheits- und aggregierten Analysezwecken verwendet.</li>
</ul>
<h2>2. Cookies</h2>
<p>Wir verwenden zwei Arten von Cookies:</p>
<ul>
<li><strong>Essenziell:</strong> Notwendig für den Betrieb der Seite (Speichern von Sprache, Standort, Erinnerungseinstellungen).</li>
<li><strong>Werbung:</strong> Wenn Google AdSense aktiviert ist, kann Google Cookies verwenden, um personalisierte Werbung anzuzeigen. Sie können diese über die <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google-Anzeigeneinstellungen</a> verwalten.</li>
</ul>
<h2>3. Dienste Dritter</h2>
<p>Die Website nutzt folgende Dienste, um ein vollständiges Erlebnis zu bieten:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> für die Städtesuche und das Reverse-Geocoding.</li>
<li><strong>Wikipedia-API:</strong> zum Abrufen von historischen und städtischen Informationen auf den Seiten „Über die Stadt".</li>
<li><strong>Google Fonts:</strong> zum Laden der arabischen Schriftart Cairo.</li>
<li><strong>Google AdSense (optional):</strong> zur Anzeige von Werbung, die hilft, die Seite kostenlos zu halten.</li>
</ul>
<h2>4. Ihre Rechte</h2>
<p>Sie haben das Recht:</p>
<ul>
<li>Die Standorterlaubnis zu verweigern, ohne dass dies Ihr Surfen beeinträchtigt.</li>
<li>Lokal gespeicherte Website-Daten über Ihre Browsereinstellungen zu löschen.</li>
<li>Personalisierte Werbung über die Google-Einstellungen zu deaktivieren.</li>
<li>Zusätzliche Informationen über unsere <a href="/de/contact">Kontaktseite</a> anzufordern.</li>
</ul>
<h2>5. Kinder</h2>
<p>Die Seite steht allen offen und richtet sich nicht speziell an Kinder unter 13 Jahren. Wir erheben wissentlich keine personenbezogenen Daten von Nutzern.</p>
<h2>6. Aktualisierungen der Richtlinie</h2>
<p>Wir können diese Richtlinie regelmäßig aktualisieren. Das Datum der letzten Aktualisierung wird oben auf der Seite angezeigt. Die fortgesetzte Nutzung der Seite nach Änderungen bedeutet die Zustimmung zur aktualisierten Version.</p>
<h2>7. Kontakt</h2>
<p>Für Fragen zu dieser Richtlinie besuchen Sie bitte unsere <a href="/de/contact">Kontaktseite</a>.</p>`,
        id: `<h1>Kebijakan Privasi</h1>
<span class="legal-meta">Terakhir diperbarui: ${new Date().toISOString().split('T')[0]}</span>
<p>Di <strong>Jadwal Sholat</strong>, kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan ini menjelaskan informasi apa yang kami kumpulkan dan bagaimana kami menggunakannya.</p>
<h2>1. Data yang Kami Kumpulkan</h2>
<p>Kami tidak memerlukan pendaftaran dan tidak menyimpan data pribadi di server kami. Informasi yang kami tangani terbatas pada:</p>
<ul>
<li><strong>Lokasi geografis:</strong> Digunakan untuk menghitung jadwal sholat dan arah Kiblat yang akurat. Izin bersifat opsional, dan koordinat Anda disimpan hanya secara lokal di browser Anda (localStorage).</li>
<li><strong>Bahasa dan preferensi:</strong> Disimpan di browser Anda untuk memberikan pengalaman yang konsisten di setiap kunjungan.</li>
<li><strong>Log server teknis:</strong> Termasuk alamat IP, jenis browser, dan halaman yang dikunjungi, hanya digunakan untuk keamanan dan analisis agregat.</li>
</ul>
<h2>2. Cookie</h2>
<p>Kami menggunakan dua jenis cookie:</p>
<ul>
<li><strong>Esensial:</strong> Diperlukan untuk operasi situs (menyimpan bahasa, lokasi, pengaturan pengingat).</li>
<li><strong>Iklan:</strong> Ketika Google AdSense diaktifkan, Google dapat menggunakan cookie untuk menampilkan iklan yang dipersonalisasi. Anda dapat mengelolanya melalui <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Pengaturan Iklan Google</a>.</li>
</ul>
<h2>3. Layanan Pihak Ketiga</h2>
<p>Situs menggunakan layanan berikut untuk memberikan pengalaman lengkap:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> untuk pencarian kota dan reverse geocoding.</li>
<li><strong>Wikipedia API:</strong> untuk mengambil informasi historis dan kota pada halaman "Tentang".</li>
<li><strong>Google Fonts:</strong> untuk memuat font Cairo bahasa Arab.</li>
<li><strong>Google AdSense (opsional):</strong> untuk menampilkan iklan yang membantu menjaga situs tetap gratis.</li>
</ul>
<h2>4. Hak Anda</h2>
<p>Anda berhak untuk:</p>
<ul>
<li>Menolak izin lokasi tanpa memengaruhi aktivitas browsing Anda.</li>
<li>Menghapus data situs yang disimpan secara lokal melalui pengaturan browser Anda.</li>
<li>Menonaktifkan iklan yang dipersonalisasi melalui pengaturan Google.</li>
<li>Meminta informasi tambahan melalui <a href="/id/contact">Halaman Kontak</a>.</li>
</ul>
<h2>5. Anak-Anak</h2>
<p>Situs terbuka untuk semua orang dan tidak secara khusus ditujukan untuk anak-anak di bawah 13 tahun. Kami tidak secara sengaja mengumpulkan data pribadi dari pengguna mana pun.</p>
<h2>6. Pembaruan Kebijakan</h2>
<p>Kami dapat memperbarui kebijakan ini secara berkala. Tanggal pembaruan terakhir akan muncul di bagian atas halaman. Melanjutkan penggunaan situs setelah perubahan berarti menerima versi yang diperbarui.</p>
<h2>7. Kontak</h2>
<p>Untuk pertanyaan apa pun tentang kebijakan ini, silakan kunjungi <a href="/id/contact">Halaman Kontak</a> kami.</p>`,
        es: `<h1>Política de Privacidad</h1>
<span class="legal-meta">Última actualización: ${new Date().toISOString().split('T')[0]}</span>
<p>En <strong>Horarios de Oración</strong>, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica qué información recopilamos y cómo la usamos.</p>
<h2>1. Datos que Recopilamos</h2>
<p>No requerimos registro ni almacenamos datos personales en nuestros servidores. La información que manejamos se limita a:</p>
<ul>
<li><strong>Ubicación geográfica:</strong> se utiliza para calcular con precisión los horarios de oración y la dirección de la Qibla. El permiso es opcional, y tus coordenadas se almacenan únicamente de forma local en tu navegador (localStorage).</li>
<li><strong>Preferencias de idioma y configuración:</strong> se guardan en tu navegador para ofrecer una experiencia consistente en cada visita.</li>
<li><strong>Registros técnicos del servidor:</strong> incluyen dirección IP, tipo de navegador y páginas visitadas, usados solo para seguridad y análisis agregados.</li>
</ul>
<h2>2. Cookies</h2>
<p>Usamos dos tipos de cookies:</p>
<ul>
<li><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (idioma, ubicación, configuración de recordatorios).</li>
<li><strong>Publicitarias:</strong> cuando Google AdSense está activado, Google puede usar cookies para mostrar anuncios personalizados. Puedes gestionarlas en la <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">configuración de anuncios de Google</a>.</li>
</ul>
<h2>3. Servicios de Terceros</h2>
<p>El sitio utiliza los siguientes servicios para ofrecer una experiencia completa:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> para búsqueda de ciudades y geocodificación inversa.</li>
<li><strong>Wikipedia API:</strong> para recuperar información histórica y sobre ciudades en las páginas "Acerca de".</li>
<li><strong>Google Fonts:</strong> para cargar la fuente árabe Cairo.</li>
<li><strong>Google AdSense (opcional):</strong> para mostrar anuncios que ayudan a mantener el sitio gratuito.</li>
</ul>
<h2>4. Tus Derechos</h2>
<p>Tienes derecho a:</p>
<ul>
<li>Rechazar el permiso de ubicación sin afectar tu navegación.</li>
<li>Borrar los datos del sitio almacenados localmente mediante la configuración de tu navegador.</li>
<li>Desactivar los anuncios personalizados a través de la configuración de Google.</li>
<li>Solicitar información adicional a través de nuestra <a href="/es/contact">página de Contacto</a>.</li>
</ul>
<h2>5. Menores</h2>
<p>El sitio está abierto a todos y no está dirigido específicamente a menores de 13 años. No recopilamos intencionalmente datos personales de ningún usuario.</p>
<h2>6. Actualizaciones de la Política</h2>
<p>Podemos actualizar esta política periódicamente. La fecha de última actualización aparece en la parte superior de la página. El uso continuado del sitio tras los cambios implica la aceptación de la versión actualizada.</p>
<h2>7. Contacto</h2>
<p>Para cualquier pregunta sobre esta política, visita nuestra <a href="/es/contact">página de Contacto</a>.</p>`,
        bn: `<h1>গোপনীয়তা নীতি</h1>
<span class="legal-meta">সর্বশেষ আপডেট: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>নামাজের সময়সূচী</strong>-তে আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। এই নীতি ব্যাখ্যা করে আমরা কোন তথ্য সংগ্রহ করি এবং কীভাবে তা ব্যবহার করি।</p>
<h2>১. আমরা যে তথ্য সংগ্রহ করি</h2>
<p>আমরা নিবন্ধন চাই না এবং আমাদের সার্ভারে কোনো ব্যক্তিগত তথ্য সংরক্ষণ করি না। আমরা যে তথ্য নিয়ে কাজ করি তা সীমাবদ্ধ:</p>
<ul>
<li><strong>ভৌগোলিক অবস্থান:</strong> নামাজের সময় ও কিবলার দিক নির্ভুলভাবে হিসাব করতে ব্যবহৃত হয়। অনুমতি ঐচ্ছিক, এবং আপনার স্থানাঙ্ক শুধু আপনার ব্রাউজারে (localStorage) স্থানীয়ভাবে সংরক্ষিত হয়।</li>
<li><strong>ভাষা ও সেটিংস পছন্দ:</strong> প্রতি সফরে একই অভিজ্ঞতা দিতে ব্রাউজারে সংরক্ষিত হয়।</li>
<li><strong>সার্ভারের কারিগরি লগ:</strong> IP ঠিকানা, ব্রাউজারের ধরন ও পরিদর্শিত পৃষ্ঠা অন্তর্ভুক্ত, শুধুমাত্র নিরাপত্তা ও সামগ্রিক বিশ্লেষণের জন্য ব্যবহৃত হয়।</li>
</ul>
<h2>২. কুকি</h2>
<p>আমরা দুই ধরনের কুকি ব্যবহার করি:</p>
<ul>
<li><strong>অপরিহার্য:</strong> সাইট চালানোর জন্য প্রয়োজনীয় (ভাষা, অবস্থান, রিমাইন্ডার সেটিংস সংরক্ষণ)।</li>
<li><strong>বিজ্ঞাপন:</strong> Google AdSense সক্রিয় হলে, Google ব্যক্তিগত বিজ্ঞাপন দেখাতে কুকি ব্যবহার করতে পারে। আপনি <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google বিজ্ঞাপন সেটিংস</a> থেকে এগুলো নিয়ন্ত্রণ করতে পারেন।</li>
</ul>
<h2>৩. তৃতীয় পক্ষের সেবা</h2>
<p>সম্পূর্ণ অভিজ্ঞতা দেওয়ার জন্য সাইটটি নিম্নলিখিত সেবাগুলো ব্যবহার করে:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> শহর অনুসন্ধান ও বিপরীত জিওকোডিংয়ের জন্য।</li>
<li><strong>Wikipedia API:</strong> "সম্পর্কে" পৃষ্ঠায় ঐতিহাসিক ও শহর সংক্রান্ত তথ্য আনার জন্য।</li>
<li><strong>Google Fonts:</strong> আরবি Cairo ফন্ট লোড করার জন্য।</li>
<li><strong>Google AdSense (ঐচ্ছিক):</strong> সাইট ফ্রি রাখতে সহায়তা করে এমন বিজ্ঞাপন দেখানোর জন্য।</li>
</ul>
<h2>৪. আপনার অধিকার</h2>
<p>আপনার অধিকার রয়েছে:</p>
<ul>
<li>ব্রাউজিংয়ে প্রভাব না ফেলে অবস্থান অনুমতি প্রত্যাখ্যান করার।</li>
<li>ব্রাউজার সেটিংসের মাধ্যমে স্থানীয়ভাবে সংরক্ষিত সাইট ডেটা মুছে ফেলার।</li>
<li>Google সেটিংসের মাধ্যমে ব্যক্তিগত বিজ্ঞাপন বন্ধ করার।</li>
<li>আমাদের <a href="/bn/contact">যোগাযোগ পৃষ্ঠা</a>-র মাধ্যমে অতিরিক্ত তথ্য অনুরোধ করার।</li>
</ul>
<h2>৫. শিশুরা</h2>
<p>সাইটটি সবার জন্য উন্মুক্ত এবং ১৩ বছরের নিচের শিশুদের জন্য বিশেষভাবে উদ্দিষ্ট নয়। আমরা কোনো ব্যবহারকারীর ব্যক্তিগত তথ্য ইচ্ছাকৃতভাবে সংগ্রহ করি না।</p>
<h2>৬. নীতি আপডেট</h2>
<p>আমরা এই নীতি নিয়মিত আপডেট করতে পারি। সর্বশেষ আপডেটের তারিখ পৃষ্ঠার উপরে দেখা যাবে। পরিবর্তনের পর সাইট ব্যবহার চালিয়ে যাওয়া আপডেটকৃত সংস্করণের সম্মতি বোঝায়।</p>
<h2>৭. যোগাযোগ</h2>
<p>এই নীতি সম্পর্কে কোনো প্রশ্নের জন্য, আমাদের <a href="/bn/contact">যোগাযোগ পৃষ্ঠা</a> দেখুন।</p>`,
        ms: `<h1>Dasar Privasi</h1>
<span class="legal-meta">Kemas kini terakhir: ${new Date().toISOString().split('T')[0]}</span>
<p>Di <strong>Waktu Solat</strong>, kami menghormati privasi anda dan komited untuk melindungi data peribadi anda. Dasar ini menerangkan maklumat yang kami kumpul dan cara kami menggunakannya.</p>
<h2>1. Data yang Kami Kumpul</h2>
<p>Kami tidak memerlukan pendaftaran dan tidak menyimpan data peribadi di pelayan kami. Maklumat yang kami uruskan terhad kepada:</p>
<ul>
<li><strong>Lokasi geografi:</strong> digunakan untuk mengira waktu solat dan arah Kiblat dengan tepat. Kebenaran bersifat pilihan, dan koordinat anda disimpan hanya secara tempatan di pelayar anda (localStorage).</li>
<li><strong>Bahasa dan keutamaan:</strong> disimpan di pelayar untuk menyediakan pengalaman konsisten pada setiap lawatan.</li>
<li><strong>Log pelayan teknikal:</strong> termasuk alamat IP, jenis pelayar dan halaman yang dilawati, digunakan hanya untuk keselamatan dan analisis agregat.</li>
</ul>
<h2>2. Kuki</h2>
<p>Kami menggunakan dua jenis kuki:</p>
<ul>
<li><strong>Penting:</strong> diperlukan untuk operasi laman (menyimpan bahasa, lokasi, tetapan peringatan).</li>
<li><strong>Pengiklanan:</strong> apabila Google AdSense diaktifkan, Google mungkin menggunakan kuki untuk memaparkan iklan diperibadikan. Anda boleh menguruskannya melalui <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Tetapan Iklan Google</a>.</li>
</ul>
<h2>3. Perkhidmatan Pihak Ketiga</h2>
<p>Laman ini menggunakan perkhidmatan berikut untuk pengalaman lengkap:</p>
<ul>
<li><strong>OpenStreetMap Nominatim:</strong> untuk carian bandar dan pengekodan geo songsang.</li>
<li><strong>Wikipedia API:</strong> untuk mendapatkan maklumat sejarah dan bandar di halaman "Tentang".</li>
<li><strong>Google Fonts:</strong> untuk memuat fon Cairo Arab.</li>
<li><strong>Google AdSense (pilihan):</strong> untuk memaparkan iklan yang membantu memastikan laman ini percuma.</li>
</ul>
<h2>4. Hak Anda</h2>
<p>Anda berhak untuk:</p>
<ul>
<li>Menolak kebenaran lokasi tanpa menjejaskan penyemakan imbas anda.</li>
<li>Memadam data laman yang disimpan secara tempatan melalui tetapan pelayar anda.</li>
<li>Menyahaktifkan iklan diperibadikan melalui tetapan Google.</li>
<li>Meminta maklumat tambahan melalui <a href="/ms/contact">Halaman Hubungi Kami</a>.</li>
</ul>
<h2>5. Kanak-kanak</h2>
<p>Laman ini terbuka untuk semua dan tidak ditujukan khusus untuk kanak-kanak di bawah 13 tahun. Kami tidak mengumpul data peribadi mana-mana pengguna secara sengaja.</p>
<h2>6. Kemas Kini Dasar</h2>
<p>Kami mungkin mengemas kini dasar ini dari semasa ke semasa. Tarikh kemas kini terakhir akan dipaparkan di bahagian atas halaman. Penggunaan berterusan laman ini selepas perubahan bermaksud anda menerima versi yang dikemas kini.</p>
<h2>7. Hubungi Kami</h2>
<p>Untuk sebarang pertanyaan tentang dasar ini, sila lawati <a href="/ms/contact">Halaman Hubungi Kami</a>.</p>`
    },
    'terms': {
        ar: `<h1>شروط الاستخدام</h1>
<span class="legal-meta">آخر تحديث: ${new Date().toISOString().split('T')[0]}</span>
<p>باستخدامك لموقع <strong>مواقيت الصلاة</strong>، فإنك توافق على الالتزام بالشروط التالية. يُرجى قراءتها بعناية قبل استخدام أي من خدمات الموقع.</p>
<h2>1. وصف الخدمة</h2>
<p>يُقدّم الموقع خدمات إسلامية مجانية، تشمل:</p>
<ul>
<li>مواقيت الصلاة الخمس بناءً على موقعك الجغرافي.</li>
<li>اتجاه القبلة وبوصلة تفاعلية.</li>
<li>التقويم الهجري ومحوّل التواريخ.</li>
<li>مجموعة الأدعية والأذكار من الكتاب والسنة.</li>
<li>المسبحة الإلكترونية وحاسبة الزكاة.</li>
</ul>
<h2>2. إخلاء المسؤولية عن الدقة</h2>
<p>نسعى دائماً لتوفير أدق المواقيت، إلا أن:</p>
<ul>
<li>مواقيت الصلاة محسوبة باستخدام معادلات فلكية موثوقة، وقد تختلف بدقائق قليلة عن المواقيت الرسمية في بلدك.</li>
<li>التقويم الهجري يعتمد على تقويم أم القرى (السعودية)، وقد يختلف يوماً واحداً عن رؤية بلدك.</li>
<li>اتجاه القبلة محسوب جغرافياً بدقة، لكن دقة عرضه على البوصلة تعتمد على حساسات جهازك.</li>
</ul>
<p>المسؤولية النهائية عن إثبات أوقات الصلاة ورؤية الأهلّة تقع على المؤسسة الدينية في بلدك.</p>
<h2>3. الاستخدام المسموح</h2>
<p>يُسمح لك باستخدام الموقع لأغراض شخصية وتعليمية، ويُحظَر:</p>
<ul>
<li>إعادة نشر محتوى الموقع آلياً (Scraping) دون إذن خطي.</li>
<li>محاولة اختراق الموقع أو إرهاق خوادمه بطلبات مفرطة.</li>
<li>استخدام الموقع لأي غرض غير مشروع أو مخالف للأخلاق العامة.</li>
</ul>
<h2>4. الملكية الفكرية</h2>
<p>جميع حقوق التصميم، الكود، الواجهات، والشعارات محفوظة لمالك الموقع. أما النصوص الدينية (الآيات، الأحاديث، الأدعية) فهي ملك عام للأمة الإسلامية.</p>
<h2>5. الخدمات الخارجية</h2>
<p>الموقع يعتمد على خدمات طرف ثالث (انظر سياسة الخصوصية). نحن غير مسؤولين عن انقطاعها أو تغييرها.</p>
<h2>6. حدود المسؤولية</h2>
<p>الموقع يُقدَّم "كما هو" دون أي ضمان صريح أو ضمني. لا نتحمّل المسؤولية عن أي قرار ديني، مالي، أو شخصي يُتّخَذ بناءً على معلومات الموقع وحدها.</p>
<h2>7. تعديل الشروط</h2>
<p>نحتفظ بحق تعديل هذه الشروط في أي وقت. التعديلات تصبح سارية فور نشرها، واستمرار استخدامك للموقع يعني قبولك بها.</p>
<h2>8. القانون الحاكم</h2>
<p>تُحكم هذه الشروط بمبادئ القانون الدولي العام لاستخدام الإنترنت. في حال نشوء نزاع، يتم حلّه ودياً قدر الإمكان.</p>`,
        en: `<h1>Terms of Use</h1>
<span class="legal-meta">Last updated: ${new Date().toISOString().split('T')[0]}</span>
<p>By using the <strong>Prayer Times</strong> website, you agree to comply with the following terms. Please read them carefully before using any service.</p>
<h2>1. Service Description</h2>
<p>The site provides free Islamic services, including:</p>
<ul>
<li>The five daily prayer times based on your geographic location.</li>
<li>Qibla direction with interactive compass.</li>
<li>Hijri calendar and date converter.</li>
<li>Authentic duas and remembrance from the Quran and Sunnah.</li>
<li>Digital tasbih counter and Zakat calculator.</li>
</ul>
<h2>2. Accuracy Disclaimer</h2>
<p>We always strive to provide the most accurate times, however:</p>
<ul>
<li>Prayer times are calculated using reliable astronomical equations and may differ by a few minutes from the official times in your country.</li>
<li>The Hijri calendar follows the Umm al-Qura calendar (Saudi Arabia) and may differ by one day from your local moon sighting.</li>
<li>The Qibla direction is geographically accurate, but its display accuracy on a compass depends on your device sensors.</li>
</ul>
<p>The ultimate responsibility for confirming prayer times and moon sighting rests with the religious authority in your country.</p>
<h2>3. Permitted Use</h2>
<p>You may use the site for personal and educational purposes. The following are prohibited:</p>
<ul>
<li>Automated scraping of site content without written permission.</li>
<li>Attempting to hack the site or overload its servers with excessive requests.</li>
<li>Using the site for any unlawful or unethical purpose.</li>
</ul>
<h2>4. Intellectual Property</h2>
<p>All rights to design, code, interfaces, and logos are reserved by the site owner. Religious texts (verses, hadith, duas) are public property of the Muslim community.</p>
<h2>5. Third-Party Services</h2>
<p>The site relies on third-party services (see Privacy Policy). We are not responsible for their interruption or changes.</p>
<h2>6. Limitation of Liability</h2>
<p>The site is provided "as is" without any express or implied warranty. We are not liable for any religious, financial, or personal decision made solely based on information from the site.</p>
<h2>7. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Changes take effect upon publication, and your continued use of the site means acceptance.</p>
<h2>8. Governing Law</h2>
<p>These terms are governed by general international principles of internet use. In case of dispute, we seek amicable resolution whenever possible.</p>`,
        fr: `<h1>Conditions d'utilisation</h1>
<span class="legal-meta">Dernière mise à jour : ${new Date().toISOString().split('T')[0]}</span>
<p>En utilisant le site <strong>Heures de Prière</strong>, vous acceptez les conditions suivantes. Veuillez les lire attentivement avant d'utiliser tout service.</p>
<h2>1. Description du service</h2>
<p>Le site propose des services islamiques gratuits, notamment :</p>
<ul>
<li>Les cinq prières quotidiennes selon votre localisation géographique.</li>
<li>Direction de la Qibla avec boussole interactive.</li>
<li>Calendrier hégirien et convertisseur de dates.</li>
<li>Invocations et rappels authentiques du Coran et de la Sunna.</li>
<li>Tasbih numérique et calculateur de Zakat.</li>
</ul>
<h2>2. Clause de non-responsabilité sur l'exactitude</h2>
<p>Nous nous efforçons de fournir les heures les plus précises, cependant :</p>
<ul>
<li>Les heures de prière sont calculées avec des équations astronomiques fiables et peuvent différer de quelques minutes des heures officielles dans votre pays.</li>
<li>Le calendrier hégirien suit le calendrier d'Umm al-Qura (Arabie saoudite) et peut différer d'un jour par rapport à l'observation lunaire locale.</li>
<li>La direction de la Qibla est géographiquement précise, mais la précision d'affichage sur une boussole dépend des capteurs de votre appareil.</li>
</ul>
<p>La responsabilité ultime de confirmer les heures de prière et l'observation lunaire incombe à l'autorité religieuse de votre pays.</p>
<h2>3. Utilisation autorisée</h2>
<p>Vous pouvez utiliser le site à des fins personnelles et éducatives. Sont interdits :</p>
<ul>
<li>La récupération automatisée (scraping) du contenu sans autorisation écrite.</li>
<li>Toute tentative de piratage ou de surcharge des serveurs par des requêtes excessives.</li>
<li>L'utilisation du site à des fins illégales ou contraires à l'éthique.</li>
</ul>
<h2>4. Propriété intellectuelle</h2>
<p>Tous les droits sur la conception, le code, les interfaces et les logos sont réservés au propriétaire du site. Les textes religieux (versets, hadiths, invocations) sont un patrimoine public de la communauté musulmane.</p>
<h2>5. Services tiers</h2>
<p>Le site dépend de services tiers (voir la politique de confidentialité). Nous ne sommes pas responsables de leur interruption ou de leurs modifications.</p>
<h2>6. Limitation de responsabilité</h2>
<p>Le site est fourni « tel quel » sans aucune garantie expresse ou implicite. Nous ne sommes pas responsables des décisions religieuses, financières ou personnelles prises uniquement sur la base des informations du site.</p>
<h2>7. Modifications des conditions</h2>
<p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication, et votre utilisation continue du site implique votre acceptation.</p>
<h2>8. Loi applicable</h2>
<p>Ces conditions sont régies par les principes généraux internationaux d'utilisation d'Internet. En cas de litige, nous recherchons une résolution amiable autant que possible.</p>`,
        tr: `<h1>Kullanım Şartları</h1>
<span class="legal-meta">Son güncelleme: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>Namaz Vakitleri</strong> sitesini kullanarak aşağıdaki şartlara uymayı kabul etmiş olursunuz. Herhangi bir hizmeti kullanmadan önce lütfen dikkatle okuyun.</p>
<h2>1. Hizmet Açıklaması</h2>
<p>Site, aşağıdakileri içeren ücretsiz İslami hizmetler sunar:</p>
<ul>
<li>Coğrafi konumunuza göre beş vakit namaz.</li>
<li>Etkileşimli pusula ile Kıble yönü.</li>
<li>Hicri takvim ve tarih dönüştürücü.</li>
<li>Kur'an ve Sünnetten özgün dua ve zikirler.</li>
<li>Dijital tesbih ve Zekat hesaplayıcı.</li>
</ul>
<h2>2. Doğruluk Sorumluluğu Reddi</h2>
<p>Her zaman en doğru vakitleri sunmaya çalışıyoruz, ancak:</p>
<ul>
<li>Namaz vakitleri güvenilir astronomik denklemler kullanılarak hesaplanır ve ülkenizdeki resmi vakitlerden birkaç dakika farklılık gösterebilir.</li>
<li>Hicri takvim Ümmül Kura takvimini (Suudi Arabistan) takip eder ve yerel hilal gözleminden bir gün farklı olabilir.</li>
<li>Kıble yönü coğrafi olarak doğrudur, ancak pusuladaki görüntüleme doğruluğu cihazınızın sensörlerine bağlıdır.</li>
</ul>
<p>Namaz vakitlerinin ve hilal gözleminin nihai sorumluluğu ülkenizdeki dini otoriteye aittir.</p>
<h2>3. İzin Verilen Kullanım</h2>
<p>Siteyi kişisel ve eğitim amaçlı kullanabilirsiniz. Aşağıdakiler yasaktır:</p>
<ul>
<li>Site içeriğinin yazılı izin olmadan otomatik olarak kazınması (scraping).</li>
<li>Siteyi hacklemeye çalışmak veya aşırı isteklerle sunucuları aşırı yüklemek.</li>
<li>Siteyi yasa dışı veya etik dışı amaçlar için kullanmak.</li>
</ul>
<h2>4. Fikri Mülkiyet</h2>
<p>Tasarım, kod, arayüzler ve logolara ilişkin tüm haklar site sahibine aittir. Dini metinler (ayetler, hadisler, dualar) Müslüman topluluğunun kamu malıdır.</p>
<h2>5. Üçüncü Taraf Hizmetler</h2>
<p>Site üçüncü taraf hizmetlere dayanır (Gizlilik Politikasına bakın). Bunların kesintisi veya değişikliğinden sorumlu değiliz.</p>
<h2>6. Sorumluluk Sınırlaması</h2>
<p>Site açık veya zımni garanti olmaksızın "olduğu gibi" sunulmaktadır. Yalnızca site bilgilerine dayanılarak verilen herhangi bir dini, mali veya kişisel karardan sorumlu değiliz.</p>
<h2>7. Şartların Değiştirilmesi</h2>
<p>Bu şartları istediğimiz zaman değiştirme hakkını saklı tutarız. Değişiklikler yayın üzerine yürürlüğe girer ve siteyi kullanmaya devam etmeniz kabul anlamına gelir.</p>
<h2>8. Uygulanacak Hukuk</h2>
<p>Bu şartlar, internet kullanımının genel uluslararası ilkelerine tabidir. Anlaşmazlık durumunda mümkün olduğunca dostane çözüm ararız.</p>`,
        ur: `<h1>شرائط استعمال</h1>
<span class="legal-meta">آخری تازہ کاری: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>اوقاتِ نماز</strong> ویب سائٹ کا استعمال کرکے آپ مندرجہ ذیل شرائط کی پابندی پر متفق ہوتے ہیں۔ کسی بھی سروس کے استعمال سے پہلے براہ کرم انہیں غور سے پڑھیں۔</p>
<h2>1. سروس کی تفصیل</h2>
<p>یہ سائٹ مفت اسلامی خدمات فراہم کرتی ہے، جن میں شامل ہیں:</p>
<ul>
<li>آپ کے جغرافیائی مقام کے مطابق پانچ وقت کی نماز کے اوقات۔</li>
<li>انٹرایکٹو قطب نما کے ساتھ قبلہ کی سمت۔</li>
<li>ہجری کیلنڈر اور تاریخ کنورٹر۔</li>
<li>قرآن و سنت سے مستند دعائیں اور اذکار۔</li>
<li>ڈیجیٹل تسبیح اور زکوٰۃ کیلکولیٹر۔</li>
</ul>
<h2>2. درستگی سے متعلق دستبرداری</h2>
<p>ہم ہمیشہ سب سے درست اوقات فراہم کرنے کی کوشش کرتے ہیں، تاہم:</p>
<ul>
<li>نماز کے اوقات قابل اعتماد فلکیاتی مساواتوں کا استعمال کرتے ہوئے حساب کیے جاتے ہیں اور آپ کے ملک کے سرکاری اوقات سے چند منٹ مختلف ہو سکتے ہیں۔</li>
<li>ہجری کیلنڈر ام القریٰ کیلنڈر (سعودی عرب) کی پیروی کرتا ہے اور آپ کے مقامی چاند دیکھنے سے ایک دن مختلف ہو سکتا ہے۔</li>
<li>قبلہ کی سمت جغرافیائی طور پر درست ہے، لیکن قطب نما پر اس کی نمائش کی درستگی آپ کے ڈیوائس کے سینسرز پر منحصر ہے۔</li>
</ul>
<p>نماز کے اوقات اور چاند دیکھنے کی حتمی ذمہ داری آپ کے ملک کے مذہبی ادارے کی ہے۔</p>
<h2>3. اجازت شدہ استعمال</h2>
<p>آپ سائٹ کو ذاتی اور تعلیمی مقاصد کے لیے استعمال کر سکتے ہیں۔ درج ذیل ممنوع ہیں:</p>
<ul>
<li>تحریری اجازت کے بغیر سائٹ کے مواد کی خودکار اسکریپنگ۔</li>
<li>سائٹ کو ہیک کرنے کی کوشش یا ضرورت سے زیادہ درخواستوں سے سرور کو اوورلوڈ کرنا۔</li>
<li>سائٹ کو کسی غیر قانونی یا غیر اخلاقی مقصد کے لیے استعمال کرنا۔</li>
</ul>
<h2>4. دانشورانہ املاک</h2>
<p>ڈیزائن، کوڈ، انٹرفیس، اور لوگو کے تمام حقوق سائٹ کے مالک کے لیے محفوظ ہیں۔ مذہبی متون (آیات، احادیث، دعائیں) مسلم کمیونٹی کی عوامی ملکیت ہیں۔</p>
<h2>5. تیسرے فریق کی خدمات</h2>
<p>سائٹ تیسرے فریق کی خدمات پر انحصار کرتی ہے (پرائیویسی پالیسی دیکھیں)۔ ہم ان کی رکاوٹ یا تبدیلیوں کے ذمہ دار نہیں ہیں۔</p>
<h2>6. ذمہ داری کی حد</h2>
<p>سائٹ کسی بھی واضح یا مضمر ضمانت کے بغیر "جیسی ہے" فراہم کی جاتی ہے۔ صرف سائٹ کی معلومات کی بنیاد پر لیے گئے کسی مذہبی، مالی، یا ذاتی فیصلے کے لیے ہم ذمہ دار نہیں ہیں۔</p>
<h2>7. شرائط میں تبدیلی</h2>
<p>ہم کسی بھی وقت ان شرائط کو تبدیل کرنے کا حق محفوظ رکھتے ہیں۔ تبدیلیاں اشاعت کے بعد نافذ العمل ہوتی ہیں، اور سائٹ کا آپ کا مسلسل استعمال قبولیت کا مطلب ہے۔</p>
<h2>8. قابل اطلاق قانون</h2>
<p>یہ شرائط انٹرنیٹ کے استعمال کے عمومی بین الاقوامی اصولوں کے تحت ہیں۔ تنازعہ کی صورت میں، ہم جہاں تک ممکن ہو دوستانہ حل تلاش کرتے ہیں۔</p>`,
        de: `<h1>Nutzungsbedingungen</h1>
<span class="legal-meta">Zuletzt aktualisiert: ${new Date().toISOString().split('T')[0]}</span>
<p>Durch die Nutzung der Website <strong>Gebetszeiten</strong> erklären Sie sich mit den folgenden Bedingungen einverstanden. Bitte lesen Sie diese sorgfältig durch, bevor Sie einen der Dienste nutzen.</p>
<h2>1. Beschreibung des Dienstes</h2>
<p>Die Seite bietet kostenlose islamische Dienste, darunter:</p>
<ul>
<li>Die fünf täglichen Gebetszeiten basierend auf Ihrem geografischen Standort.</li>
<li>Qibla-Richtung mit interaktivem Kompass.</li>
<li>Hidschri-Kalender und Datumsumrechner.</li>
<li>Authentische Duas und Gedenken aus Koran und Sunna.</li>
<li>Digitaler Tasbih-Zähler und Zakat-Rechner.</li>
</ul>
<h2>2. Genauigkeitshinweis</h2>
<p>Wir bemühen uns stets, die genauesten Zeiten anzubieten, jedoch:</p>
<ul>
<li>Die Gebetszeiten werden mit zuverlässigen astronomischen Gleichungen berechnet und können um einige Minuten von den offiziellen Zeiten in Ihrem Land abweichen.</li>
<li>Der Hidschri-Kalender folgt dem Umm-al-Qura-Kalender (Saudi-Arabien) und kann um einen Tag von der lokalen Mondsichtung abweichen.</li>
<li>Die Qibla-Richtung ist geografisch präzise, aber die Anzeigegenauigkeit auf einem Kompass hängt von den Sensoren Ihres Geräts ab.</li>
</ul>
<p>Die letzte Verantwortung für die Bestätigung der Gebetszeiten und der Mondsichtung liegt bei der religiösen Autorität in Ihrem Land.</p>
<h2>3. Erlaubte Nutzung</h2>
<p>Sie dürfen die Seite für persönliche und Bildungszwecke nutzen. Folgendes ist untersagt:</p>
<ul>
<li>Automatisiertes Scraping von Seiteninhalten ohne schriftliche Genehmigung.</li>
<li>Versuche, die Seite zu hacken oder ihre Server mit übermäßigen Anfragen zu überlasten.</li>
<li>Die Nutzung der Seite für rechtswidrige oder unethische Zwecke.</li>
</ul>
<h2>4. Geistiges Eigentum</h2>
<p>Alle Rechte an Design, Code, Schnittstellen und Logos sind dem Eigentümer der Seite vorbehalten. Religiöse Texte (Verse, Hadithe, Duas) sind öffentliches Eigentum der muslimischen Gemeinschaft.</p>
<h2>5. Dienste Dritter</h2>
<p>Die Seite stützt sich auf Dienste Dritter (siehe Datenschutzerklärung). Wir übernehmen keine Verantwortung für deren Unterbrechung oder Änderung.</p>
<h2>6. Haftungsbeschränkung</h2>
<p>Die Seite wird „wie besehen" ohne ausdrückliche oder stillschweigende Gewährleistung bereitgestellt. Wir haften nicht für religiöse, finanzielle oder persönliche Entscheidungen, die ausschließlich auf Grundlage der Informationen dieser Seite getroffen werden.</p>
<h2>7. Änderungen der Bedingungen</h2>
<p>Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Änderungen treten mit ihrer Veröffentlichung in Kraft, und Ihre fortgesetzte Nutzung der Seite bedeutet Zustimmung.</p>
<h2>8. Geltendes Recht</h2>
<p>Diese Bedingungen unterliegen den allgemeinen internationalen Grundsätzen der Internetnutzung. Im Streitfall streben wir eine gütliche Einigung an, wann immer dies möglich ist.</p>`,
        id: `<h1>Syarat Penggunaan</h1>
<span class="legal-meta">Terakhir diperbarui: ${new Date().toISOString().split('T')[0]}</span>
<p>Dengan menggunakan situs <strong>Jadwal Sholat</strong>, Anda setuju untuk mematuhi syarat-syarat berikut. Harap baca dengan cermat sebelum menggunakan layanan situs apa pun.</p>
<h2>1. Deskripsi Layanan</h2>
<p>Situs ini menyediakan layanan Islami gratis, termasuk:</p>
<ul>
<li>Lima waktu sholat harian berdasarkan lokasi geografis Anda.</li>
<li>Arah Kiblat dengan kompas interaktif.</li>
<li>Kalender Hijriyah dan konverter tanggal.</li>
<li>Doa dan dzikir otentik dari Al-Qur'an dan Sunnah.</li>
<li>Tasbih digital dan kalkulator Zakat.</li>
</ul>
<h2>2. Catatan Akurasi</h2>
<p>Kami selalu berusaha memberikan waktu yang paling akurat, namun:</p>
<ul>
<li>Jadwal sholat dihitung menggunakan persamaan astronomi yang andal dan dapat berbeda beberapa menit dari waktu resmi di negara Anda.</li>
<li>Kalender Hijriyah mengikuti kalender Umm al-Qura (Arab Saudi) dan dapat berbeda satu hari dari rukyat hilal lokal.</li>
<li>Arah Kiblat akurat secara geografis, tetapi akurasi tampilannya pada kompas bergantung pada sensor perangkat Anda.</li>
</ul>
<p>Tanggung jawab akhir untuk mengonfirmasi waktu sholat dan rukyat hilal terletak pada otoritas agama di negara Anda.</p>
<h2>3. Penggunaan yang Diizinkan</h2>
<p>Anda dapat menggunakan situs ini untuk tujuan pribadi dan pendidikan. Hal berikut dilarang:</p>
<ul>
<li>Scraping otomatis terhadap konten situs tanpa izin tertulis.</li>
<li>Upaya meretas situs atau membebani servernya dengan permintaan berlebihan.</li>
<li>Menggunakan situs untuk tujuan yang melanggar hukum atau tidak etis.</li>
</ul>
<h2>4. Kekayaan Intelektual</h2>
<p>Semua hak atas desain, kode, antarmuka, dan logo dilindungi oleh pemilik situs. Teks-teks keagamaan (ayat, hadits, doa) merupakan milik publik komunitas Muslim.</p>
<h2>5. Layanan Pihak Ketiga</h2>
<p>Situs bergantung pada layanan pihak ketiga (lihat Kebijakan Privasi). Kami tidak bertanggung jawab atas gangguan atau perubahannya.</p>
<h2>6. Batasan Tanggung Jawab</h2>
<p>Situs disediakan "apa adanya" tanpa jaminan tersurat maupun tersirat. Kami tidak bertanggung jawab atas keputusan keagamaan, keuangan, atau pribadi apa pun yang diambil semata-mata berdasarkan informasi situs.</p>
<h2>7. Perubahan Syarat</h2>
<p>Kami berhak mengubah syarat-syarat ini kapan saja. Perubahan berlaku setelah dipublikasikan, dan penggunaan situs yang berkelanjutan berarti persetujuan Anda.</p>
<h2>8. Hukum yang Berlaku</h2>
<p>Syarat-syarat ini tunduk pada prinsip-prinsip umum internasional penggunaan internet. Jika terjadi sengketa, kami berupaya mencari solusi damai sebisa mungkin.</p>`,
        es: `<h1>Términos de Uso</h1>
<span class="legal-meta">Última actualización: ${new Date().toISOString().split('T')[0]}</span>
<p>Al usar el sitio <strong>Horarios de Oración</strong>, aceptas cumplir con los siguientes términos. Léelos cuidadosamente antes de usar cualquier servicio del sitio.</p>
<h2>1. Descripción del Servicio</h2>
<p>El sitio ofrece servicios islámicos gratuitos, entre ellos:</p>
<ul>
<li>Los cinco horarios de oración diarios según tu ubicación geográfica.</li>
<li>Dirección de la Qibla con una brújula interactiva.</li>
<li>Calendario Hégira y conversor de fechas.</li>
<li>Duas y dhikr auténticos tomados del Corán y la Sunnah.</li>
<li>Tasbih digital y calculadora de Zakat.</li>
</ul>
<h2>2. Nota sobre la Precisión</h2>
<p>Siempre nos esforzamos por ofrecer los tiempos más precisos, pero:</p>
<ul>
<li>Los horarios de oración se calculan con ecuaciones astronómicas fiables y pueden diferir en unos minutos respecto a los tiempos oficiales de tu país.</li>
<li>El calendario Hégira sigue el calendario Umm al-Qura (Arabia Saudí) y puede diferir en un día respecto al avistamiento local de la luna.</li>
<li>La dirección de la Qibla es geográficamente precisa, pero la exactitud de su visualización en la brújula depende de los sensores de tu dispositivo.</li>
</ul>
<p>La responsabilidad final de confirmar los horarios de oración y el avistamiento de la luna recae en las autoridades religiosas de tu país.</p>
<h2>3. Uso Permitido</h2>
<p>Puedes usar el sitio para fines personales y educativos. Queda prohibido:</p>
<ul>
<li>Extraer contenido del sitio de forma automatizada sin autorización por escrito.</li>
<li>Intentar piratear el sitio o sobrecargar sus servidores con peticiones excesivas.</li>
<li>Usar el sitio con fines ilegales o no éticos.</li>
</ul>
<h2>4. Propiedad Intelectual</h2>
<p>Todos los derechos sobre el diseño, el código, la interfaz y los logotipos están reservados por el propietario del sitio. Los textos religiosos (versículos, hadices, duas) son patrimonio público de la comunidad musulmana.</p>
<h2>5. Servicios de Terceros</h2>
<p>El sitio depende de servicios de terceros (ver la Política de Privacidad). No somos responsables de sus interrupciones ni de sus cambios.</p>
<h2>6. Limitación de Responsabilidad</h2>
<p>El sitio se ofrece "tal cual", sin garantías expresas ni implícitas. No somos responsables de ninguna decisión religiosa, financiera o personal tomada únicamente en base a la información del sitio.</p>
<h2>7. Cambios en los Términos</h2>
<p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigor tras su publicación, y el uso continuado del sitio implica aceptación.</p>
<h2>8. Ley Aplicable</h2>
<p>Estos términos se rigen por los principios internacionales generales del uso de Internet. En caso de disputa, buscamos una solución amistosa siempre que sea posible.</p>`,
        bn: `<h1>শর্তাবলী</h1>
<span class="legal-meta">সর্বশেষ আপডেট: ${new Date().toISOString().split('T')[0]}</span>
<p><strong>নামাজের সময়সূচী</strong> সাইটটি ব্যবহার করে, আপনি নিম্নলিখিত শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। সাইটের যেকোনো সেবা ব্যবহারের আগে সেগুলো মনোযোগ সহকারে পড়ুন।</p>
<h2>১. সেবার বিবরণ</h2>
<p>সাইটটি বিনামূল্যে ইসলামি সেবা প্রদান করে, যার মধ্যে রয়েছে:</p>
<ul>
<li>আপনার ভৌগোলিক অবস্থানের উপর ভিত্তি করে পাঁচ ওয়াক্ত দৈনিক নামাজের সময়।</li>
<li>ইন্টারঅ্যাকটিভ কম্পাসের মাধ্যমে কিবলার দিক।</li>
<li>হিজরি ক্যালেন্ডার ও তারিখ রূপান্তরকারী।</li>
<li>কুরআন ও সুন্নাহ থেকে সহিহ দোয়া ও জিকির।</li>
<li>ডিজিটাল তাসবিহ ও যাকাত ক্যালকুলেটর।</li>
</ul>
<h2>২. নির্ভুলতা সম্পর্কিত নোট</h2>
<p>আমরা সর্বদা সবচেয়ে নির্ভুল সময় প্রদানের চেষ্টা করি, তবে:</p>
<ul>
<li>নামাজের সময় নির্ভরযোগ্য জ্যোতির্বিদ্যার সমীকরণ ব্যবহার করে হিসাব করা হয় এবং আপনার দেশের সরকারি সময়ের থেকে কয়েক মিনিট ভিন্ন হতে পারে।</li>
<li>হিজরি ক্যালেন্ডার উম্মুল কুরা ক্যালেন্ডার (সৌদি আরব) অনুসরণ করে এবং স্থানীয় চাঁদ দেখার তারিখ থেকে এক দিন ভিন্ন হতে পারে।</li>
<li>কিবলার দিক ভৌগোলিকভাবে সঠিক, তবে কম্পাসে এর প্রদর্শনের নির্ভুলতা আপনার ডিভাইসের সেন্সরের উপর নির্ভর করে।</li>
</ul>
<p>নামাজের সময় ও চাঁদ দেখার চূড়ান্ত নিশ্চিতকরণের দায়িত্ব আপনার দেশের ধর্মীয় কর্তৃপক্ষের উপর বর্তায়।</p>
<h2>৩. অনুমোদিত ব্যবহার</h2>
<p>আপনি ব্যক্তিগত ও শিক্ষামূলক উদ্দেশ্যে সাইটটি ব্যবহার করতে পারেন। নিম্নলিখিত বিষয়গুলো নিষিদ্ধ:</p>
<ul>
<li>লিখিত অনুমতি ছাড়া সাইটের কন্টেন্টের স্বয়ংক্রিয় স্ক্র্যাপিং।</li>
<li>সাইট হ্যাক করার চেষ্টা বা অতিরিক্ত অনুরোধ দিয়ে তার সার্ভারে অতিরিক্ত চাপ সৃষ্টি করা।</li>
<li>অবৈধ বা অনৈতিক উদ্দেশ্যে সাইট ব্যবহার করা।</li>
</ul>
<h2>৪. মেধাস্বত্ব</h2>
<p>ডিজাইন, কোড, ইন্টারফেস ও লোগোর সকল অধিকার সাইটের মালিকের কাছে সংরক্ষিত। ধর্মীয় পাঠ্যসমূহ (আয়াত, হাদিস, দোয়া) মুসলিম সমাজের সাধারণ সম্পত্তি।</p>
<h2>৫. তৃতীয় পক্ষের সেবা</h2>
<p>সাইটটি তৃতীয় পক্ষের সেবার উপর নির্ভর করে (গোপনীয়তা নীতি দেখুন)। আমরা তাদের বিঘ্ন বা পরিবর্তনের জন্য দায়ী নই।</p>
<h2>৬. দায়বদ্ধতার সীমা</h2>
<p>সাইটটি "যেমন আছে" ভিত্তিতে প্রদান করা হয়, কোনো প্রকাশ্য বা অন্তর্নিহিত ওয়ারেন্টি ছাড়াই। শুধু সাইটের তথ্যের উপর ভিত্তি করে নেওয়া কোনো ধর্মীয়, আর্থিক বা ব্যক্তিগত সিদ্ধান্তের জন্য আমরা দায়ী নই।</p>
<h2>৭. শর্তাবলীর পরিবর্তন</h2>
<p>আমরা যে কোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি। পরিবর্তনগুলো প্রকাশের পর কার্যকর হয় এবং সাইট ব্যবহার চালিয়ে যাওয়া সম্মতির অর্থ বহন করে।</p>
<h2>৮. প্রযোজ্য আইন</h2>
<p>এই শর্তাবলী ইন্টারনেট ব্যবহারের সাধারণ আন্তর্জাতিক নীতির অধীন। কোনো বিরোধের ক্ষেত্রে, আমরা যতটা সম্ভব শান্তিপূর্ণ সমাধান খোঁজার চেষ্টা করি।</p>`,
        ms: `<h1>Terma Penggunaan</h1>
<span class="legal-meta">Kemas kini terakhir: ${new Date().toISOString().split('T')[0]}</span>
<p>Dengan menggunakan laman <strong>Waktu Solat</strong>, anda bersetuju untuk mematuhi terma berikut. Sila baca dengan teliti sebelum menggunakan mana-mana perkhidmatan laman.</p>
<h2>1. Penerangan Perkhidmatan</h2>
<p>Laman ini menyediakan perkhidmatan Islam percuma, termasuk:</p>
<ul>
<li>Lima waktu solat harian berdasarkan lokasi geografi anda.</li>
<li>Arah Kiblat dengan kompas interaktif.</li>
<li>Kalendar Hijrah dan penukar tarikh.</li>
<li>Doa dan zikir sahih dari Al-Quran dan Sunnah.</li>
<li>Tasbih digital dan kalkulator Zakat.</li>
</ul>
<h2>2. Nota Ketepatan</h2>
<p>Kami sentiasa berusaha memberikan waktu yang paling tepat, namun:</p>
<ul>
<li>Waktu solat dikira menggunakan persamaan astronomi yang boleh dipercayai dan mungkin berbeza beberapa minit dari waktu rasmi di negara anda.</li>
<li>Kalendar Hijrah mengikuti kalendar Umm al-Qura (Arab Saudi) dan mungkin berbeza satu hari dari rukyah tempatan.</li>
<li>Arah Kiblat adalah tepat dari segi geografi, tetapi ketepatan paparan pada kompas bergantung pada sensor peranti anda.</li>
</ul>
<p>Tanggungjawab akhir untuk mengesahkan waktu solat dan rukyah hilal terletak pada pihak berkuasa agama di negara anda.</p>
<h2>3. Penggunaan yang Dibenarkan</h2>
<p>Anda boleh menggunakan laman ini untuk tujuan peribadi dan pendidikan. Yang berikut adalah dilarang:</p>
<ul>
<li>Mengikis kandungan laman secara automatik tanpa kebenaran bertulis.</li>
<li>Cuba menggodam laman atau membebankan pelayannya dengan permintaan berlebihan.</li>
<li>Menggunakan laman untuk tujuan yang menyalahi undang-undang atau tidak beretika.</li>
</ul>
<h2>4. Harta Intelek</h2>
<p>Semua hak ke atas reka bentuk, kod, antara muka dan logo terpelihara oleh pemilik laman. Teks keagamaan (ayat, hadis, doa) adalah hak milik umum masyarakat Muslim.</p>
<h2>5. Perkhidmatan Pihak Ketiga</h2>
<p>Laman ini bergantung pada perkhidmatan pihak ketiga (rujuk Dasar Privasi). Kami tidak bertanggungjawab atas gangguan atau perubahannya.</p>
<h2>6. Had Tanggungjawab</h2>
<p>Laman ini disediakan "sebagaimana adanya" tanpa jaminan nyata atau tersirat. Kami tidak bertanggungjawab atas sebarang keputusan agama, kewangan atau peribadi yang dibuat hanya berdasarkan maklumat laman.</p>
<h2>7. Perubahan Terma</h2>
<p>Kami berhak mengubah terma ini pada bila-bila masa. Perubahan berkuat kuasa selepas diterbitkan, dan penggunaan berterusan laman bermaksud persetujuan.</p>
<h2>8. Undang-undang Terpakai</h2>
<p>Terma ini tertakluk kepada prinsip antarabangsa umum penggunaan Internet. Jika berlaku pertikaian, kami berusaha mencari penyelesaian secara baik sebisa mungkin.</p>`
    },
    'contact': {
        ar: `<h1>اتصل بنا</h1>
<p>يسعدنا تواصلكم معنا. سواء كان لديك سؤال، اقتراح، أو بلاغ عن خطأ في مواقيت الصلاة في مدينتك، فريقنا جاهز للاستماع إليك.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">للتواصل المباشر</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>أنواع الاستفسارات التي نستقبلها</h2>
<ul>
<li><strong>الإبلاغ عن مواقيت غير دقيقة:</strong> أرفق اسم المدينة، الإحداثيات (إن أمكن)، والفرق بين موقيت الموقع والموقت الرسمي في بلدك.</li>
<li><strong>اقتراحات تحسين:</strong> أي ميزة جديدة، تصميم أفضل، أو لغة تودّ إضافتها.</li>
<li><strong>طلبات شراكة:</strong> للأكاديميات، المساجد، أو التطبيقات التي تودّ استخدام بيانات الموقع.</li>
<li><strong>الإبلاغ عن أخطاء تقنية:</strong> صفحات لا تعمل، ميزات معطّلة، أو مشاكل في العرض.</li>
<li><strong>الأسئلة الدينية المتعلقة بالحساب:</strong> طريقة حساب مواقيت الصلاة، أوقات الفجر/العشاء، والمذاهب الفقهية المعتمَدة.</li>
</ul>
<h2>وقت الاستجابة</h2>
<p>نسعى للرد على جميع الرسائل خلال <strong>3-5 أيام عمل</strong>. الرسائل المتعلقة بأخطاء فنية تحظى بأولوية أعلى.</p>
<h2>قبل المراسلة</h2>
<p>قد تجد إجابة سؤالك في:</p>
<ul>
<li><a href="/about-us">صفحة "عن الموقع"</a> — تشرح مهمتنا وميزاتنا.</li>
<li><a href="/terms">شروط الاستخدام</a> — تجيب على أسئلة الدقة والمسؤولية.</li>
<li><a href="/privacy">سياسة الخصوصية</a> — تشرح كيف نتعامل مع بياناتك.</li>
</ul>
<h2>المتابعة على منصات التواصل</h2>
<p>سنقوم قريباً بإطلاق حسابات رسمية على منصات التواصل الاجتماعي. تابع الموقع للحصول على آخر التحديثات.</p>`,
        en: `<h1>Contact Us</h1>
<p>We are pleased to hear from you. Whether you have a question, suggestion, or report about inaccurate prayer times in your city, our team is ready to listen.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Direct contact</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Types of inquiries we receive</h2>
<ul>
<li><strong>Reporting inaccurate times:</strong> Include the city name, coordinates (if possible), and the difference between site times and the official times in your country.</li>
<li><strong>Improvement suggestions:</strong> Any new feature, better design, or additional language.</li>
<li><strong>Partnership requests:</strong> For academies, mosques, or apps that wish to use site data.</li>
<li><strong>Reporting technical errors:</strong> Non-working pages, broken features, or display issues.</li>
<li><strong>Religious questions about calculations:</strong> Methods of calculating prayer times, Fajr/Isha times, and adopted fiqh schools.</li>
</ul>
<h2>Response time</h2>
<p>We aim to reply to all messages within <strong>3–5 business days</strong>. Messages about technical errors receive higher priority.</p>
<h2>Before reaching out</h2>
<p>You may find your answer in:</p>
<ul>
<li><a href="/en/about-us">About Us page</a> — explains our mission and features.</li>
<li><a href="/en/terms">Terms of Use</a> — answers questions about accuracy and responsibility.</li>
<li><a href="/en/privacy">Privacy Policy</a> — explains how we handle your data.</li>
</ul>
<h2>Social media follow-up</h2>
<p>We will soon launch official accounts on social media platforms. Follow the site for the latest updates.</p>`,
        fr: `<h1>Contact</h1>
<p>Nous sommes heureux de vous lire. Que vous ayez une question, une suggestion ou un signalement concernant des heures de prière inexactes dans votre ville, notre équipe est prête à vous écouter.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Contact direct</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Types de demandes que nous recevons</h2>
<ul>
<li><strong>Signaler des heures inexactes :</strong> incluez le nom de la ville, les coordonnées (si possible), et la différence entre les heures du site et celles officielles dans votre pays.</li>
<li><strong>Suggestions d'amélioration :</strong> toute nouvelle fonctionnalité, un meilleur design ou une langue supplémentaire.</li>
<li><strong>Demandes de partenariat :</strong> pour les académies, mosquées ou applications souhaitant utiliser les données du site.</li>
<li><strong>Signalement d'erreurs techniques :</strong> pages qui ne fonctionnent pas, fonctionnalités cassées ou problèmes d'affichage.</li>
<li><strong>Questions religieuses sur les calculs :</strong> méthodes de calcul des heures, Fajr/Isha, et écoles de fiqh adoptées.</li>
</ul>
<h2>Délai de réponse</h2>
<p>Nous nous efforçons de répondre à tous les messages dans un délai de <strong>3 à 5 jours ouvrables</strong>. Les messages concernant des erreurs techniques sont prioritaires.</p>
<h2>Avant de nous contacter</h2>
<p>Vous pouvez trouver la réponse à votre question dans :</p>
<ul>
<li><a href="/fr/about-us">La page « À propos »</a> — explique notre mission et nos fonctionnalités.</li>
<li><a href="/fr/terms">Conditions d'utilisation</a> — répond aux questions de précision et de responsabilité.</li>
<li><a href="/fr/privacy">Politique de confidentialité</a> — explique comment nous traitons vos données.</li>
</ul>
<h2>Suivi sur les réseaux sociaux</h2>
<p>Nous lancerons prochainement des comptes officiels sur les plateformes de réseaux sociaux. Suivez le site pour les dernières mises à jour.</p>`,
        tr: `<h1>İletişim</h1>
<p>Sizden haber almak bizi mutlu eder. Bir sorunuz, öneriniz veya şehrinizdeki yanlış namaz vakitleri hakkında bildiriminiz olsun, ekibimiz sizi dinlemeye hazırdır.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Doğrudan iletişim</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Aldığımız sorgu türleri</h2>
<ul>
<li><strong>Yanlış vakitleri bildirme:</strong> şehir adını, koordinatları (mümkünse) ve site vakitleri ile ülkenizdeki resmi vakitler arasındaki farkı belirtin.</li>
<li><strong>İyileştirme önerileri:</strong> herhangi bir yeni özellik, daha iyi tasarım veya ek dil.</li>
<li><strong>Ortaklık talepleri:</strong> site verilerini kullanmak isteyen akademiler, camiler veya uygulamalar için.</li>
<li><strong>Teknik hata bildirimleri:</strong> çalışmayan sayfalar, bozuk özellikler veya görüntüleme sorunları.</li>
<li><strong>Hesaplamalarla ilgili dini sorular:</strong> namaz vakitlerinin hesaplanma yöntemleri, Fajr/İşa vakitleri ve benimsenen fıkıh mezhepleri.</li>
</ul>
<h2>Yanıt süresi</h2>
<p>Tüm mesajlara <strong>3-5 iş günü</strong> içinde yanıt vermeye çalışıyoruz. Teknik hatalarla ilgili mesajlar daha yüksek önceliklidir.</p>
<h2>Bize ulaşmadan önce</h2>
<p>Sorunuzun yanıtını şurada bulabilirsiniz:</p>
<ul>
<li><a href="/tr/about-us">"Hakkımızda" sayfası</a> — misyonumuzu ve özelliklerimizi açıklar.</li>
<li><a href="/tr/terms">Kullanım Şartları</a> — doğruluk ve sorumlulukla ilgili soruları yanıtlar.</li>
<li><a href="/tr/privacy">Gizlilik Politikası</a> — verilerinizi nasıl işlediğimizi açıklar.</li>
</ul>
<h2>Sosyal medya takibi</h2>
<p>Yakında sosyal medya platformlarında resmi hesaplar açacağız. En son güncellemeler için siteyi takip edin.</p>`,
        ur: `<h1>ہم سے رابطہ کریں</h1>
<p>ہمیں آپ سے سن کر خوشی ہوگی۔ چاہے آپ کا کوئی سوال، تجویز، یا آپ کے شہر میں نماز کے غلط اوقات کے بارے میں رپورٹ ہو، ہماری ٹیم سننے کے لیے تیار ہے۔</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">براہ راست رابطہ</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>ہم جن قسم کی پوچھ گچھ وصول کرتے ہیں</h2>
<ul>
<li><strong>غلط اوقات کی اطلاع:</strong> شہر کا نام، کوآرڈینیٹس (اگر ممکن ہو)، اور سائٹ کے اوقات اور آپ کے ملک میں سرکاری اوقات کے درمیان فرق شامل کریں۔</li>
<li><strong>بہتری کی تجاویز:</strong> کوئی بھی نیا فیچر، بہتر ڈیزائن، یا اضافی زبان۔</li>
<li><strong>شراکت کی درخواستیں:</strong> اکیڈمیوں، مساجد، یا سائٹ کا ڈیٹا استعمال کرنے کے خواہشمند ایپس کے لیے۔</li>
<li><strong>تکنیکی خرابیوں کی اطلاع:</strong> کام نہ کرنے والے صفحات، ٹوٹے ہوئے فیچرز، یا ڈسپلے کے مسائل۔</li>
<li><strong>حسابات سے متعلق مذہبی سوالات:</strong> نماز کے اوقات کا حساب کرنے کے طریقے، فجر/عشاء کے اوقات، اور اپنائے گئے فقہی مکاتب فکر۔</li>
</ul>
<h2>جواب کا وقت</h2>
<p>ہم تمام پیغامات کا جواب <strong>3-5 کاروباری دنوں</strong> کے اندر دینے کی کوشش کرتے ہیں۔ تکنیکی خرابیوں سے متعلق پیغامات کو زیادہ ترجیح ملتی ہے۔</p>
<h2>ہم سے رابطہ کرنے سے پہلے</h2>
<p>آپ کو اپنے سوال کا جواب یہاں مل سکتا ہے:</p>
<ul>
<li><a href="/ur/about-us">"ہمارے بارے میں" صفحہ</a> — ہمارے مشن اور خصوصیات کی وضاحت کرتا ہے۔</li>
<li><a href="/ur/terms">شرائط استعمال</a> — درستگی اور ذمہ داری کے سوالات کے جوابات دیتا ہے۔</li>
<li><a href="/ur/privacy">پرائیویسی پالیسی</a> — بتاتی ہے کہ ہم آپ کے ڈیٹا کو کیسے سنبھالتے ہیں۔</li>
</ul>
<h2>سوشل میڈیا پر فالو اپ</h2>
<p>ہم جلد ہی سوشل میڈیا پلیٹ فارمز پر آفیشل اکاؤنٹس لانچ کریں گے۔ تازہ ترین اپ ڈیٹس کے لیے سائٹ کو فالو کریں۔</p>`,
        de: `<h1>Kontakt</h1>
<p>Wir freuen uns, von Ihnen zu hören. Ob Sie eine Frage, einen Vorschlag oder eine Meldung zu ungenauen Gebetszeiten in Ihrer Stadt haben — unser Team steht bereit, Ihnen zuzuhören.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Direkter Kontakt</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Welche Anfragen wir erhalten</h2>
<ul>
<li><strong>Meldung ungenauer Zeiten:</strong> Geben Sie den Stadtnamen, die Koordinaten (falls möglich) und den Unterschied zwischen den Zeiten auf der Seite und den offiziellen Zeiten in Ihrem Land an.</li>
<li><strong>Verbesserungsvorschläge:</strong> Neue Funktionen, besseres Design oder eine zusätzliche Sprache.</li>
<li><strong>Partnerschaftsanfragen:</strong> Für Akademien, Moscheen oder Apps, die Seitendaten nutzen möchten.</li>
<li><strong>Meldung technischer Fehler:</strong> Nicht funktionierende Seiten, defekte Funktionen oder Anzeigeprobleme.</li>
<li><strong>Religiöse Fragen zu Berechnungen:</strong> Methoden zur Berechnung der Gebetszeiten, Fajr/Isha-Zeiten und die verwendeten Rechtsschulen.</li>
</ul>
<h2>Antwortzeit</h2>
<p>Wir bemühen uns, alle Nachrichten innerhalb von <strong>3–5 Werktagen</strong> zu beantworten. Nachrichten zu technischen Fehlern erhalten eine höhere Priorität.</p>
<h2>Bevor Sie uns kontaktieren</h2>
<p>Die Antwort auf Ihre Frage finden Sie möglicherweise in:</p>
<ul>
<li><a href="/de/about-us">Über uns</a> — erklärt unsere Mission und Funktionen.</li>
<li><a href="/de/terms">Nutzungsbedingungen</a> — beantwortet Fragen zu Genauigkeit und Verantwortung.</li>
<li><a href="/de/privacy">Datenschutzerklärung</a> — erklärt, wie wir mit Ihren Daten umgehen.</li>
</ul>
<h2>Soziale Medien</h2>
<p>Wir werden in Kürze offizielle Konten auf Social-Media-Plattformen einrichten. Folgen Sie der Seite für die neuesten Updates.</p>`,
        id: `<h1>Hubungi Kami</h1>
<p>Kami senang mendengar dari Anda. Baik Anda memiliki pertanyaan, saran, atau laporan tentang jadwal sholat yang tidak akurat di kota Anda, tim kami siap mendengarkan.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Kontak Langsung</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Jenis Pertanyaan yang Kami Terima</h2>
<ul>
<li><strong>Melaporkan waktu yang tidak akurat:</strong> Sertakan nama kota, koordinat (jika mungkin), dan selisih antara waktu di situs dan waktu resmi di negara Anda.</li>
<li><strong>Saran peningkatan:</strong> Fitur baru, desain yang lebih baik, atau bahasa tambahan.</li>
<li><strong>Permintaan kerja sama:</strong> Untuk akademi, masjid, atau aplikasi yang ingin menggunakan data situs.</li>
<li><strong>Melaporkan kesalahan teknis:</strong> Halaman yang tidak berfungsi, fitur yang rusak, atau masalah tampilan.</li>
<li><strong>Pertanyaan agama tentang perhitungan:</strong> Metode perhitungan jadwal sholat, waktu Subuh/Isya, dan mazhab fikih yang diadopsi.</li>
</ul>
<h2>Waktu Respons</h2>
<p>Kami berusaha merespons semua pesan dalam waktu <strong>3-5 hari kerja</strong>. Pesan terkait kesalahan teknis mendapat prioritas lebih tinggi.</p>
<h2>Sebelum Menghubungi Kami</h2>
<p>Anda mungkin menemukan jawaban atas pertanyaan Anda di:</p>
<ul>
<li><a href="/id/about-us">Halaman "Tentang Kami"</a> — menjelaskan misi dan fitur kami.</li>
<li><a href="/id/terms">Syarat Penggunaan</a> — menjawab pertanyaan akurasi dan tanggung jawab.</li>
<li><a href="/id/privacy">Kebijakan Privasi</a> — menjelaskan cara kami menangani data Anda.</li>
</ul>
<h2>Media Sosial</h2>
<p>Kami akan segera meluncurkan akun resmi di platform media sosial. Ikuti situs untuk pembaruan terbaru.</p>`,
        es: `<h1>Contáctanos</h1>
<p>Nos encanta saber de ti. Ya sea que tengas una pregunta, una sugerencia o un informe sobre un horario de oración inexacto en tu ciudad, nuestro equipo está listo para escucharte.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Contacto directo</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Tipos de Consultas que Recibimos</h2>
<ul>
<li><strong>Reportar un horario inexacto:</strong> incluye el nombre de la ciudad, las coordenadas (si es posible) y la diferencia entre el horario del sitio y el oficial de tu país.</li>
<li><strong>Sugerencias de mejora:</strong> nuevas funciones, mejor diseño o idiomas adicionales.</li>
<li><strong>Solicitudes de colaboración:</strong> para academias, mezquitas o aplicaciones que deseen usar los datos del sitio.</li>
<li><strong>Reportar un error técnico:</strong> página que no funciona, función rota o problema de visualización.</li>
<li><strong>Preguntas religiosas sobre el cálculo:</strong> método de cálculo de los horarios, tiempo de Fajr/Isha y escuelas jurídicas adoptadas.</li>
</ul>
<h2>Tiempo de Respuesta</h2>
<p>Procuramos responder a todos los mensajes en un plazo de <strong>3-5 días laborables</strong>. Los mensajes sobre errores técnicos tienen mayor prioridad.</p>
<h2>Antes de Contactarnos</h2>
<p>Es posible que encuentres la respuesta a tu pregunta en:</p>
<ul>
<li><a href="/es/about-us">Página "Sobre Nosotros"</a> — explica nuestra misión y características.</li>
<li><a href="/es/terms">Términos de Uso</a> — responde a preguntas sobre precisión y responsabilidad.</li>
<li><a href="/es/privacy">Política de Privacidad</a> — explica cómo manejamos tus datos.</li>
</ul>
<h2>Redes Sociales</h2>
<p>Pronto lanzaremos cuentas oficiales en las principales redes sociales. Sigue el sitio para las últimas novedades.</p>`,
        bn: `<h1>যোগাযোগ করুন</h1>
<p>আমরা আপনার কাছ থেকে শুনতে ভালোবাসি। আপনার কোনো প্রশ্ন, পরামর্শ, বা আপনার শহরে ভুল নামাজের সময় সম্পর্কে রিপোর্ট থাকুক — আমাদের দল শুনতে প্রস্তুত।</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">সরাসরি যোগাযোগ</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>যে ধরনের প্রশ্ন আমরা গ্রহণ করি</h2>
<ul>
<li><strong>ভুল সময় রিপোর্ট করা:</strong> শহরের নাম, স্থানাঙ্ক (সম্ভব হলে), এবং সাইটের সময় ও আপনার দেশের সরকারি সময়ের মধ্যে পার্থক্য অন্তর্ভুক্ত করুন।</li>
<li><strong>উন্নয়নের পরামর্শ:</strong> নতুন ফিচার, উন্নত ডিজাইন, বা অতিরিক্ত ভাষা।</li>
<li><strong>সহযোগিতার অনুরোধ:</strong> সাইটের ডেটা ব্যবহার করতে চাওয়া একাডেমি, মসজিদ বা অ্যাপের জন্য।</li>
<li><strong>কারিগরি ত্রুটি রিপোর্ট করা:</strong> কাজ না করা পৃষ্ঠা, ভাঙা ফিচার বা প্রদর্শন সমস্যা।</li>
<li><strong>গণনা সম্পর্কে ধর্মীয় প্রশ্ন:</strong> নামাজের সময় গণনার পদ্ধতি, ফজর/এশার সময় এবং গৃহীত ফিকহি মাজহাব।</li>
</ul>
<h2>প্রতিক্রিয়ার সময়</h2>
<p>আমরা সব বার্তায় <strong>৩-৫ কার্যদিবসের</strong> মধ্যে সাড়া দেওয়ার চেষ্টা করি। কারিগরি ত্রুটির বার্তা উচ্চ অগ্রাধিকার পায়।</p>
<h2>যোগাযোগের আগে</h2>
<p>আপনি আপনার প্রশ্নের উত্তর এখানে পেতে পারেন:</p>
<ul>
<li><a href="/bn/about-us">"আমাদের সম্পর্কে" পৃষ্ঠা</a> — আমাদের লক্ষ্য ও বৈশিষ্ট্য ব্যাখ্যা করে।</li>
<li><a href="/bn/terms">শর্তাবলী</a> — নির্ভুলতা ও দায়িত্ব সম্পর্কিত প্রশ্নের উত্তর দেয়।</li>
<li><a href="/bn/privacy">গোপনীয়তা নীতি</a> — আমরা কীভাবে আপনার ডেটা পরিচালনা করি তা ব্যাখ্যা করে।</li>
</ul>
<h2>সামাজিক মাধ্যম</h2>
<p>আমরা শীঘ্রই সামাজিক মাধ্যম প্ল্যাটফর্মে অফিসিয়াল অ্যাকাউন্ট চালু করব। সর্বশেষ আপডেটের জন্য সাইট ফলো করুন।</p>`,
        ms: `<h1>Hubungi Kami</h1>
<p>Kami gembira mendengar daripada anda. Sama ada anda mempunyai pertanyaan, cadangan atau laporan tentang waktu solat yang tidak tepat di bandar anda, pasukan kami sedia mendengar.</p>
<div class="contact-card">
    <span style="font-size:2rem;">✉️</span>
    <div>
        <div style="font-size:0.85rem;opacity:0.85;">Hubungan terus</div>
        <a href="mailto:contact@prayer-times.example">contact@prayer-times.example</a>
    </div>
</div>
<h2>Jenis Pertanyaan yang Kami Terima</h2>
<ul>
<li><strong>Laporkan waktu yang tidak tepat:</strong> sertakan nama bandar, koordinat (jika mungkin) dan perbezaan antara waktu di laman dan waktu rasmi di negara anda.</li>
<li><strong>Cadangan penambahbaikan:</strong> ciri baharu, reka bentuk yang lebih baik atau bahasa tambahan.</li>
<li><strong>Permintaan kerjasama:</strong> untuk akademi, masjid atau aplikasi yang ingin menggunakan data laman.</li>
<li><strong>Laporkan ralat teknikal:</strong> halaman yang tidak berfungsi, ciri yang rosak atau masalah paparan.</li>
<li><strong>Soalan agama tentang pengiraan:</strong> kaedah pengiraan waktu solat, waktu Subuh/Isyak dan mazhab feqah yang digunakan.</li>
</ul>
<h2>Masa Respons</h2>
<p>Kami berusaha membalas semua mesej dalam tempoh <strong>3-5 hari bekerja</strong>. Mesej berkaitan ralat teknikal mendapat keutamaan lebih tinggi.</p>
<h2>Sebelum Menghubungi Kami</h2>
<p>Anda mungkin menjumpai jawapan kepada soalan anda di:</p>
<ul>
<li><a href="/ms/about-us">Halaman "Tentang Kami"</a> — menerangkan misi dan ciri-ciri kami.</li>
<li><a href="/ms/terms">Terma Penggunaan</a> — menjawab persoalan ketepatan dan tanggungjawab.</li>
<li><a href="/ms/privacy">Dasar Privasi</a> — menerangkan cara kami mengendalikan data anda.</li>
</ul>
<h2>Media Sosial</h2>
<p>Kami akan melancarkan akaun rasmi di platform media sosial tidak lama lagi. Ikuti laman ini untuk kemas kini terkini.</p>`
    },
    'about-us': {
        ar: `<h1>عن موقع مواقيت الصلاة</h1>
<p>موقع <strong>مواقيت الصلاة</strong> هو مشروع إسلامي مجاني يهدف إلى توفير أدوات إسلامية يومية موثوقة ودقيقة لكل مسلم حول العالم — في أي مدينة، بأي لغة، وعلى أي جهاز.</p>
<h2>رسالتنا</h2>
<p>نؤمن بأن الأدوات الدينية اليومية يجب أن تكون:</p>
<ul>
<li><strong>مجانية:</strong> الإسلام للجميع، ولا يجب أن تُحتجَب أدواته خلف اشتراكات.</li>
<li><strong>دقيقة:</strong> نعتمد على أحدث المعادلات الفلكية ومصادر دينية موثوقة.</li>
<li><strong>سريعة وخفيفة:</strong> الموقع يعمل على أبطأ الاتصالات وأقدم الأجهزة.</li>
<li><strong>محترِمة للخصوصية:</strong> لا نطلب تسجيلاً ولا نخزّن بياناتك على خوادمنا.</li>
</ul>
<h2>الميزات الرئيسية</h2>
<ul>
<li><strong>مواقيت الصلاة:</strong> الفجر، الظهر، العصر، المغرب، العشاء — لكل مدينة في العالم، مع جدول أسبوعي وتنبيه قبل كل صلاة.</li>
<li><strong>اتجاه القبلة:</strong> بوصلة تفاعلية وخريطة تُظهر اتجاه الكعبة المشرفة من موقعك بدقة.</li>
<li><strong>التقويم الهجري:</strong> تقويم كامل من سنة 1 هـ إلى 1500 هـ، ومحوّل بين الهجري والميلادي.</li>
<li><strong>الأدعية والأذكار:</strong> مجموعة منظَّمة من الكتاب والسنة (أذكار الصباح، المساء، الصلاة، النوم، السفر…).</li>
<li><strong>المسبحة الإلكترونية:</strong> عدّاد ذكر يحفظ تقدّمك ويسمح بتحديد أهداف يومية.</li>
<li><strong>حاسبة الزكاة:</strong> تشمل النقد، الذهب، الفضة، الأسهم، والاستثمارات.</li>
<li><strong>صفحات المدن:</strong> آلاف الصفحات لمدن العالم، كل صفحة تحتوي معلومات جغرافية ومواقيت ودقيقة.</li>
</ul>
<h2>كيف نحسب مواقيت الصلاة؟</h2>
<p>نستخدم خوارزميات فلكية مُعتمَدة دولياً، مع دعم لمذاهب الحساب الرئيسية:</p>
<ul>
<li>الجمعية الإسلامية لأمريكا الشمالية (ISNA)</li>
<li>رابطة العالم الإسلامي (MWL)</li>
<li>الهيئة المصرية العامة للمساحة</li>
<li>أم القرى — السعودية</li>
<li>جامعة العلوم الإسلامية كراتشي</li>
</ul>
<h2>اللغات المدعومة</h2>
<p>الموقع متاح حالياً بـ <strong>العربية</strong> و <strong>الإنجليزية</strong>، ونعمل على إضافة لغات جديدة (التركية، الفرنسية، الأردية، الإندونيسية).</p>
<h2>الفريق</h2>
<p>الموقع مشروع تطوّعي يديره مسلمون يحبّون أمتهم، ويهدفون لخدمتها بأفضل الأدوات التقنية. نرحّب بانضمام أي مطوّر، مصمّم، أو مترجم — تواصل معنا عبر <a href="/contact">صفحة الاتصال</a>.</p>
<h2>كيف يُموَّل الموقع؟</h2>
<p>الموقع مجاني تماماً. نعتمد على عوائد إعلانات Google AdSense (المخطط لها) لتغطية تكاليف الخوادم والتطوير. لن نعرض إعلاناتٍ مزعِجة أو مخالفة لقيمنا الإسلامية.</p>`,
        en: `<h1>About Prayer Times</h1>
<p><strong>Prayer Times</strong> is a free Islamic project aiming to provide reliable and accurate daily Islamic tools for every Muslim worldwide — in any city, any language, and on any device.</p>
<h2>Our Mission</h2>
<p>We believe that daily religious tools should be:</p>
<ul>
<li><strong>Free:</strong> Islam is for everyone, and its tools should not be locked behind subscriptions.</li>
<li><strong>Accurate:</strong> We rely on the latest astronomical equations and trusted religious sources.</li>
<li><strong>Fast and lightweight:</strong> The site works on the slowest connections and oldest devices.</li>
<li><strong>Privacy-respecting:</strong> No registration required, and we do not store your data on our servers.</li>
</ul>
<h2>Key Features</h2>
<ul>
<li><strong>Prayer times:</strong> Fajr, Dhuhr, Asr, Maghrib, Isha — for every city in the world, with weekly schedule and pre-prayer reminders.</li>
<li><strong>Qibla direction:</strong> Interactive compass and map showing the Kaaba direction from your location accurately.</li>
<li><strong>Hijri calendar:</strong> Full calendar from year 1 AH to 1500 AH, plus a Hijri-Gregorian converter.</li>
<li><strong>Duas and Athkar:</strong> Organized collection from Quran and Sunnah (morning, evening, prayer, sleep, travel…).</li>
<li><strong>Digital Tasbih:</strong> Counter that saves your progress and supports daily targets.</li>
<li><strong>Zakat calculator:</strong> Covers cash, gold, silver, stocks, and investments.</li>
<li><strong>City pages:</strong> Thousands of pages for cities worldwide, each with geographic info and accurate times.</li>
</ul>
<h2>How do we calculate prayer times?</h2>
<p>We use internationally adopted astronomical algorithms, supporting major calculation schools:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Muslim World League (MWL)</li>
<li>Egyptian General Authority of Survey</li>
<li>Umm al-Qura — Saudi Arabia</li>
<li>University of Islamic Sciences, Karachi</li>
</ul>
<h2>Supported Languages</h2>
<p>The site is currently available in <strong>Arabic</strong> and <strong>English</strong>, with new languages in development (Turkish, French, Urdu, Indonesian).</p>
<h2>The Team</h2>
<p>The site is a volunteer project run by Muslims who love their Ummah and aim to serve it with the best technology. We welcome developers, designers, and translators — contact us via the <a href="/en/contact">Contact page</a>.</p>
<h2>How is the site funded?</h2>
<p>The site is completely free. We rely on Google AdSense revenue (planned) to cover server and development costs. We will not display intrusive ads or anything inconsistent with our Islamic values.</p>`,
        fr: `<h1>À propos d'Heures de Prière</h1>
<p><strong>Heures de Prière</strong> est un projet islamique gratuit visant à fournir des outils islamiques quotidiens fiables et précis à chaque musulman dans le monde — dans n'importe quelle ville, n'importe quelle langue et sur n'importe quel appareil.</p>
<h2>Notre mission</h2>
<p>Nous pensons que les outils religieux quotidiens doivent être :</p>
<ul>
<li><strong>Gratuits :</strong> l'Islam est pour tous, et ses outils ne doivent pas être bloqués derrière des abonnements.</li>
<li><strong>Précis :</strong> nous nous appuyons sur les dernières équations astronomiques et des sources religieuses fiables.</li>
<li><strong>Rapides et légers :</strong> le site fonctionne sur les connexions les plus lentes et les appareils les plus anciens.</li>
<li><strong>Respectueux de la vie privée :</strong> aucune inscription requise et aucune donnée stockée sur nos serveurs.</li>
</ul>
<h2>Fonctionnalités principales</h2>
<ul>
<li><strong>Heures de prière :</strong> Fajr, Dhouhr, Asr, Maghrib, Isha — pour chaque ville du monde, avec un programme hebdomadaire et des rappels avant la prière.</li>
<li><strong>Direction de la Qibla :</strong> boussole interactive et carte montrant la direction de la Kaaba depuis votre emplacement avec précision.</li>
<li><strong>Calendrier hégirien :</strong> calendrier complet de l'an 1 AH à 1500 AH, plus un convertisseur hégirien-grégorien.</li>
<li><strong>Invocations et dhikrs :</strong> collection organisée du Coran et de la Sunna (matin, soir, prière, sommeil, voyage…).</li>
<li><strong>Tasbih numérique :</strong> compteur qui sauvegarde votre progression et prend en charge les objectifs quotidiens.</li>
<li><strong>Calculateur de Zakat :</strong> couvre l'argent, l'or, l'argent, les actions et les investissements.</li>
<li><strong>Pages de villes :</strong> des milliers de pages pour les villes du monde entier, chacune avec des informations géographiques et des heures précises.</li>
</ul>
<h2>Comment calculons-nous les heures de prière ?</h2>
<p>Nous utilisons des algorithmes astronomiques adoptés internationalement, prenant en charge les principales écoles de calcul :</p>
<ul>
<li>Société islamique d'Amérique du Nord (ISNA)</li>
<li>Ligue mondiale musulmane (MWL)</li>
<li>Autorité générale égyptienne d'arpentage</li>
<li>Umm al-Qura — Arabie saoudite</li>
<li>Université des sciences islamiques, Karachi</li>
</ul>
<h2>Langues prises en charge</h2>
<p>Le site est actuellement disponible en <strong>arabe</strong>, <strong>anglais</strong>, <strong>français</strong>, <strong>turc</strong> et <strong>ourdou</strong>.</p>
<h2>L'équipe</h2>
<p>Le site est un projet bénévole géré par des musulmans qui aiment leur Oumma et cherchent à la servir avec les meilleures technologies. Nous accueillons les développeurs, designers et traducteurs — contactez-nous via la <a href="/fr/contact">page Contact</a>.</p>
<h2>Comment le site est-il financé ?</h2>
<p>Le site est entièrement gratuit. Nous comptons sur les revenus de Google AdSense (prévus) pour couvrir les coûts du serveur et du développement. Nous n'afficherons pas de publicités intrusives ou contraires à nos valeurs islamiques.</p>`,
        tr: `<h1>Namaz Vakitleri Hakkında</h1>
<p><strong>Namaz Vakitleri</strong>, dünyadaki her Müslümana — herhangi bir şehirde, herhangi bir dilde ve herhangi bir cihazda — güvenilir ve doğru günlük İslami araçlar sağlamayı amaçlayan ücretsiz bir İslami projedir.</p>
<h2>Misyonumuz</h2>
<p>Günlük dini araçların şöyle olması gerektiğine inanıyoruz:</p>
<ul>
<li><strong>Ücretsiz:</strong> İslam herkes içindir ve araçları abonelikler arkasına kilitlenmemelidir.</li>
<li><strong>Doğru:</strong> En son astronomik denklemlere ve güvenilir dini kaynaklara dayanıyoruz.</li>
<li><strong>Hızlı ve hafif:</strong> Site en yavaş bağlantılarda ve en eski cihazlarda çalışır.</li>
<li><strong>Gizliliğe saygılı:</strong> Kayıt gerekmiyor ve sunucularımızda veri saklamıyoruz.</li>
</ul>
<h2>Ana Özellikler</h2>
<ul>
<li><strong>Namaz vakitleri:</strong> Fajr, Öğle, İkindi, Akşam, Yatsı — dünyanın her şehri için, haftalık program ve namaz öncesi hatırlatıcılarla.</li>
<li><strong>Kıble yönü:</strong> Konumunuzdan Kâbe yönünü doğru şekilde gösteren etkileşimli pusula ve harita.</li>
<li><strong>Hicri takvim:</strong> 1 AH'den 1500 AH'ye kadar tam takvim, ayrıca Hicri-Miladi dönüştürücü.</li>
<li><strong>Dualar ve zikirler:</strong> Kur'an ve Sünnetten organize edilmiş koleksiyon (sabah, akşam, namaz, uyku, yolculuk…).</li>
<li><strong>Dijital Tesbih:</strong> İlerlemenizi kaydeden ve günlük hedefleri destekleyen sayaç.</li>
<li><strong>Zekat hesaplayıcı:</strong> Nakit, altın, gümüş, hisse senedi ve yatırımları kapsar.</li>
<li><strong>Şehir sayfaları:</strong> Dünya çapında şehirler için binlerce sayfa, her biri coğrafi bilgiler ve doğru vakitlerle.</li>
</ul>
<h2>Namaz vakitlerini nasıl hesaplıyoruz?</h2>
<p>Uluslararası olarak benimsenmiş astronomik algoritmalar kullanıyoruz ve başlıca hesaplama ekollerini destekliyoruz:</p>
<ul>
<li>Kuzey Amerika İslam Toplumu (ISNA)</li>
<li>Dünya İslam Birliği (MWL)</li>
<li>Mısır Genel Etüt Kurumu</li>
<li>Ümmül Kura — Suudi Arabistan</li>
<li>Karaçi İslami Bilimler Üniversitesi</li>
</ul>
<h2>Desteklenen Diller</h2>
<p>Site şu anda <strong>Arapça</strong>, <strong>İngilizce</strong>, <strong>Fransızca</strong>, <strong>Türkçe</strong> ve <strong>Urduca</strong> olarak mevcuttur.</p>
<h2>Ekip</h2>
<p>Site, Ümmetini seven ve ona en iyi teknoloji ile hizmet etmeyi amaçlayan Müslümanlar tarafından yürütülen gönüllü bir projedir. Geliştiricileri, tasarımcıları ve çevirmenleri bekliyoruz — bizimle <a href="/tr/contact">İletişim sayfası</a> üzerinden iletişime geçin.</p>
<h2>Site nasıl finanse edilir?</h2>
<p>Site tamamen ücretsizdir. Sunucu ve geliştirme maliyetlerini karşılamak için Google AdSense gelirine (planlanan) güveniyoruz. Saldırgan reklamlar veya İslami değerlerimizle tutarsız hiçbir şey göstermeyeceğiz.</p>`,
        ur: `<h1>اوقاتِ نماز کے بارے میں</h1>
<p><strong>اوقاتِ نماز</strong> ایک مفت اسلامی منصوبہ ہے جس کا مقصد دنیا بھر کے ہر مسلمان کو قابل اعتماد اور درست روزمرہ اسلامی ٹولز فراہم کرنا ہے — کسی بھی شہر میں، کسی بھی زبان میں، اور کسی بھی ڈیوائس پر۔</p>
<h2>ہمارا مشن</h2>
<p>ہمارا ماننا ہے کہ روزمرہ کے مذہبی ٹولز ہونے چاہئیں:</p>
<ul>
<li><strong>مفت:</strong> اسلام سب کے لیے ہے، اور اس کے ٹولز سبسکرپشنز کے پیچھے بند نہیں ہونے چاہئیں۔</li>
<li><strong>درست:</strong> ہم جدید ترین فلکیاتی مساواتوں اور قابل اعتماد مذہبی ذرائع پر انحصار کرتے ہیں۔</li>
<li><strong>تیز اور ہلکے:</strong> سائٹ سب سے سست کنکشنز اور سب سے پرانے آلات پر کام کرتی ہے۔</li>
<li><strong>پرائیویسی کا احترام:</strong> کوئی رجسٹریشن درکار نہیں، اور ہم آپ کا ڈیٹا اپنے سرورز پر محفوظ نہیں کرتے۔</li>
</ul>
<h2>اہم خصوصیات</h2>
<ul>
<li><strong>نماز کے اوقات:</strong> فجر، ظہر، عصر، مغرب، عشاء — دنیا کے ہر شہر کے لیے، ہفتہ وار شیڈول اور نماز سے پہلے یاد دہانی کے ساتھ۔</li>
<li><strong>قبلہ کی سمت:</strong> انٹرایکٹو قطب نما اور نقشہ جو آپ کے مقام سے کعبہ کی سمت درست طور پر دکھاتا ہے۔</li>
<li><strong>ہجری کیلنڈر:</strong> 1 ہجری سے 1500 ہجری تک مکمل کیلنڈر، نیز ہجری-عیسوی کنورٹر۔</li>
<li><strong>دعائیں اور اذکار:</strong> قرآن اور سنت سے منظم مجموعہ (صبح، شام، نماز، نیند، سفر…)۔</li>
<li><strong>ڈیجیٹل تسبیح:</strong> کاؤنٹر جو آپ کی پیش رفت محفوظ کرتا ہے اور روزانہ اہداف کی حمایت کرتا ہے۔</li>
<li><strong>زکوٰۃ کیلکولیٹر:</strong> نقد، سونا، چاندی، اسٹاک اور سرمایہ کاری شامل ہیں۔</li>
<li><strong>شہر کے صفحات:</strong> دنیا بھر کے شہروں کے لیے ہزاروں صفحات، ہر ایک جغرافیائی معلومات اور درست اوقات کے ساتھ۔</li>
</ul>
<h2>ہم نماز کے اوقات کیسے حساب کرتے ہیں؟</h2>
<p>ہم بین الاقوامی طور پر اپنائے گئے فلکیاتی الگورتھم استعمال کرتے ہیں، جو اہم حساب کے مکاتب فکر کی حمایت کرتے ہیں:</p>
<ul>
<li>شمالی امریکہ کی اسلامی سوسائٹی (ISNA)</li>
<li>رابطہ عالم اسلامی (MWL)</li>
<li>مصری جنرل اتھارٹی برائے سروے</li>
<li>ام القریٰ — سعودی عرب</li>
<li>یونیورسٹی آف اسلامک سائنسز، کراچی</li>
</ul>
<h2>معاون زبانیں</h2>
<p>سائٹ اس وقت <strong>عربی</strong>، <strong>انگریزی</strong>، <strong>فرانسیسی</strong>، <strong>ترکی</strong> اور <strong>اردو</strong> میں دستیاب ہے۔</p>
<h2>ٹیم</h2>
<p>یہ سائٹ رضاکارانہ منصوبہ ہے جسے مسلمان چلاتے ہیں جو اپنی امت سے محبت کرتے ہیں اور بہترین ٹیکنالوجی کے ساتھ اس کی خدمت کرنے کا مقصد رکھتے ہیں۔ ہم ڈویلپرز، ڈیزائنرز اور مترجمین کا خیرمقدم کرتے ہیں — ہمارے <a href="/ur/contact">رابطہ صفحے</a> کے ذریعے ہم سے رابطہ کریں۔</p>
<h2>سائٹ کی فنڈنگ کیسے ہوتی ہے؟</h2>
<p>سائٹ مکمل طور پر مفت ہے۔ سرور اور ڈیولپمنٹ کے اخراجات کو پورا کرنے کے لیے ہم Google AdSense کی آمدنی پر انحصار کرتے ہیں (منصوبہ بند)۔ ہم دخل اندازی والے اشتہارات یا ہماری اسلامی اقدار سے متضاد کچھ بھی نہیں دکھائیں گے۔</p>`,
        de: `<h1>Über Gebetszeiten</h1>
<p><strong>Gebetszeiten</strong> ist ein kostenloses islamisches Projekt, das darauf abzielt, jedem Muslim weltweit zuverlässige und präzise tägliche islamische Werkzeuge zur Verfügung zu stellen — in jeder Stadt, in jeder Sprache und auf jedem Gerät.</p>
<h2>Unsere Mission</h2>
<p>Wir glauben, dass tägliche religiöse Werkzeuge sein sollten:</p>
<ul>
<li><strong>Kostenlos:</strong> Der Islam ist für alle da, und seine Werkzeuge sollten nicht hinter Abonnements verborgen sein.</li>
<li><strong>Präzise:</strong> Wir stützen uns auf die neuesten astronomischen Gleichungen und zuverlässige religiöse Quellen.</li>
<li><strong>Schnell und leicht:</strong> Die Seite funktioniert auch bei den langsamsten Verbindungen und auf den ältesten Geräten.</li>
<li><strong>Datenschutzfreundlich:</strong> Keine Registrierung erforderlich, und wir speichern Ihre Daten nicht auf unseren Servern.</li>
</ul>
<h2>Hauptfunktionen</h2>
<ul>
<li><strong>Gebetszeiten:</strong> Fajr, Dhuhr, Asr, Maghrib, Isha — für jede Stadt weltweit, mit Wochenplan und Erinnerungen vor jedem Gebet.</li>
<li><strong>Qibla-Richtung:</strong> Interaktiver Kompass und Karte, die die Richtung zur Kaaba präzise von Ihrem Standort aus anzeigen.</li>
<li><strong>Hidschri-Kalender:</strong> Vollständiger Kalender vom Jahr 1 AH bis 1500 AH sowie ein Hidschri-Gregorianischer Umrechner.</li>
<li><strong>Duas und Adhkar:</strong> Organisierte Sammlung aus Koran und Sunna (Morgen, Abend, Gebet, Schlaf, Reise…).</li>
<li><strong>Digitaler Tasbih:</strong> Zähler, der Ihren Fortschritt speichert und tägliche Ziele unterstützt.</li>
<li><strong>Zakat-Rechner:</strong> Umfasst Bargeld, Gold, Silber, Aktien und Investitionen.</li>
<li><strong>Stadtseiten:</strong> Tausende von Seiten für Städte weltweit, jede mit geografischen Informationen und präzisen Zeiten.</li>
</ul>
<h2>Wie berechnen wir die Gebetszeiten?</h2>
<p>Wir verwenden international anerkannte astronomische Algorithmen und unterstützen die wichtigsten Berechnungsschulen:</p>
<ul>
<li>Islamische Gesellschaft Nordamerikas (ISNA)</li>
<li>Muslimische Weltliga (MWL)</li>
<li>Ägyptische Generalbehörde für Vermessung</li>
<li>Umm al-Qura — Saudi-Arabien</li>
<li>Universität der Islamischen Wissenschaften, Karachi</li>
</ul>
<h2>Unterstützte Sprachen</h2>
<p>Die Seite ist derzeit auf <strong>Arabisch</strong>, <strong>Englisch</strong>, <strong>Französisch</strong>, <strong>Türkisch</strong>, <strong>Urdu</strong> und <strong>Deutsch</strong> verfügbar.</p>
<h2>Das Team</h2>
<p>Die Seite ist ein ehrenamtliches Projekt, das von Muslimen geleitet wird, die ihre Umma lieben und ihr mit den besten Technologien dienen möchten. Wir begrüßen Entwickler, Designer und Übersetzer — kontaktieren Sie uns über die <a href="/de/contact">Kontaktseite</a>.</p>
<h2>Wie wird die Seite finanziert?</h2>
<p>Die Seite ist vollständig kostenlos. Wir stützen uns auf die Einnahmen von Google AdSense (geplant), um Server- und Entwicklungskosten zu decken. Wir werden keine aufdringliche Werbung oder Inhalte anzeigen, die im Widerspruch zu unseren islamischen Werten stehen.</p>`,
        id: `<h1>Tentang Jadwal Sholat</h1>
<p><strong>Jadwal Sholat</strong> adalah proyek Islami gratis yang bertujuan menyediakan perangkat Islami harian yang andal dan akurat untuk setiap Muslim di seluruh dunia — di kota mana pun, dalam bahasa apa pun, dan di perangkat apa pun.</p>
<h2>Misi Kami</h2>
<p>Kami percaya bahwa perangkat keagamaan harian haruslah:</p>
<ul>
<li><strong>Gratis:</strong> Islam untuk semua, dan alat-alatnya tidak boleh disembunyikan di balik langganan.</li>
<li><strong>Akurat:</strong> Kami mengandalkan persamaan astronomi terbaru dan sumber-sumber keagamaan yang andal.</li>
<li><strong>Cepat dan ringan:</strong> Situs bekerja pada koneksi paling lambat dan perangkat paling tua.</li>
<li><strong>Menghormati privasi:</strong> Tidak diperlukan pendaftaran, dan kami tidak menyimpan data Anda di server kami.</li>
</ul>
<h2>Fitur Utama</h2>
<ul>
<li><strong>Jadwal Sholat:</strong> Subuh, Zuhur, Asar, Magrib, Isya — untuk setiap kota di dunia, dengan jadwal mingguan dan pengingat sebelum setiap sholat.</li>
<li><strong>Arah Kiblat:</strong> Kompas interaktif dan peta yang menunjukkan arah Kakbah secara akurat dari lokasi Anda.</li>
<li><strong>Kalender Hijriyah:</strong> Kalender lengkap dari tahun 1 H hingga 1500 H serta konverter Hijriyah-Masehi.</li>
<li><strong>Doa dan Dzikir:</strong> Koleksi tersusun dari Al-Qur'an dan Sunnah (pagi, sore, sholat, tidur, perjalanan…).</li>
<li><strong>Tasbih Digital:</strong> Penghitung yang menyimpan kemajuan Anda dan mendukung target harian.</li>
<li><strong>Kalkulator Zakat:</strong> Mencakup tunai, emas, perak, saham, dan investasi.</li>
<li><strong>Halaman kota:</strong> Ribuan halaman untuk kota-kota di seluruh dunia, masing-masing dengan informasi geografis dan waktu yang akurat.</li>
</ul>
<h2>Bagaimana Kami Menghitung Jadwal Sholat?</h2>
<p>Kami menggunakan algoritma astronomi yang diakui secara internasional dengan dukungan untuk mazhab perhitungan utama:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Liga Dunia Muslim (MWL)</li>
<li>Otoritas Umum Mesir untuk Survei</li>
<li>Umm al-Qura — Arab Saudi</li>
<li>Universitas Ilmu Islam, Karachi</li>
</ul>
<h2>Bahasa yang Didukung</h2>
<p>Situs saat ini tersedia dalam <strong>Arab</strong>, <strong>Inggris</strong>, <strong>Prancis</strong>, <strong>Turki</strong>, <strong>Urdu</strong>, <strong>Jerman</strong>, dan <strong>Indonesia</strong>.</p>
<h2>Tim</h2>
<p>Situs ini adalah proyek sukarela yang dijalankan oleh Muslim yang mencintai umat mereka dan bertujuan melayani dengan teknologi terbaik. Kami menyambut pengembang, desainer, dan penerjemah — hubungi kami melalui <a href="/id/contact">halaman kontak</a>.</p>
<h2>Bagaimana Situs Ini Didanai?</h2>
<p>Situs ini sepenuhnya gratis. Kami mengandalkan pendapatan Google AdSense (direncanakan) untuk menutupi biaya server dan pengembangan. Kami tidak akan menampilkan iklan yang mengganggu atau konten apa pun yang bertentangan dengan nilai-nilai Islam kami.</p>`,
        es: `<h1>Sobre Horarios de Oración</h1>
<p><strong>Horarios de Oración</strong> es un proyecto islámico gratuito cuyo objetivo es ofrecer herramientas islámicas diarias fiables y precisas a todo musulmán del mundo — en cualquier ciudad, en cualquier idioma y en cualquier dispositivo.</p>
<h2>Nuestra Misión</h2>
<p>Creemos que las herramientas religiosas diarias deben ser:</p>
<ul>
<li><strong>Gratuitas:</strong> el Islam es para todos, y sus herramientas no deben quedar ocultas tras una suscripción.</li>
<li><strong>Precisas:</strong> nos apoyamos en las ecuaciones astronómicas más actualizadas y en fuentes religiosas fiables.</li>
<li><strong>Rápidas y ligeras:</strong> el sitio funciona con las conexiones más lentas y los dispositivos más antiguos.</li>
<li><strong>Respetuosas con la privacidad:</strong> no requiere registro y no almacenamos tus datos en nuestros servidores.</li>
</ul>
<h2>Características Principales</h2>
<ul>
<li><strong>Horarios de oración:</strong> Fajr, Dhuhr, Asr, Magrib, Isha — para cada ciudad del mundo, con programa semanal y recordatorios antes de cada oración.</li>
<li><strong>Dirección de la Qibla:</strong> brújula interactiva y mapa que muestran la dirección de la Kaaba con precisión desde tu ubicación.</li>
<li><strong>Calendario Hégira:</strong> calendario completo desde el año 1 AH hasta el 1500 AH, con conversor Hégira ↔ Gregoriano.</li>
<li><strong>Duas y dhikr:</strong> colección organizada tomada del Corán y la Sunnah (mañana, tarde, oración, sueño, viaje…).</li>
<li><strong>Tasbih digital:</strong> contador que guarda tu progreso y admite objetivos diarios.</li>
<li><strong>Calculadora de Zakat:</strong> incluye efectivo, oro, plata, acciones e inversiones.</li>
<li><strong>Páginas de ciudades:</strong> miles de páginas para ciudades de todo el mundo, cada una con información geográfica y horarios precisos.</li>
</ul>
<h2>¿Cómo Calculamos los Horarios de Oración?</h2>
<p>Utilizamos algoritmos astronómicos reconocidos internacionalmente, compatibles con las principales escuelas de cálculo:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Liga Mundial Musulmana (MWL)</li>
<li>Autoridad General Egipcia de Topografía</li>
<li>Umm al-Qura — Arabia Saudí</li>
<li>Universidad de Ciencias Islámicas, Karachi</li>
</ul>
<h2>Idiomas Disponibles</h2>
<p>El sitio está actualmente disponible en <strong>Árabe</strong>, <strong>Inglés</strong>, <strong>Francés</strong>, <strong>Turco</strong>, <strong>Urdu</strong>, <strong>Alemán</strong>, <strong>Indonesio</strong>, <strong>Español</strong>, <strong>Bengalí</strong> y <strong>Malayo</strong>.</p>
<h2>El Equipo</h2>
<p>El sitio es un proyecto voluntario dirigido por musulmanes que aman a su Ummah y buscan servirla con la mejor tecnología. Damos la bienvenida a desarrolladores, diseñadores y traductores — contáctanos a través de nuestra <a href="/es/contact">página de Contacto</a>.</p>
<h2>¿Cómo se Financia el Sitio?</h2>
<p>El sitio es totalmente gratuito. Dependemos de los ingresos de Google AdSense (previsto) para cubrir los costes de servidor y desarrollo. Nunca mostraremos anuncios intrusivos ni contenidos contrarios a nuestros valores islámicos.</p>`,
        bn: `<h1>নামাজের সময়সূচী সম্পর্কে</h1>
<p><strong>নামাজের সময়সূচী</strong> একটি বিনামূল্যে ইসলামি প্রকল্প যার লক্ষ্য বিশ্বের প্রতিটি মুসলিমের জন্য — যে কোনো শহরে, যে কোনো ভাষায় এবং যে কোনো ডিভাইসে — নির্ভরযোগ্য ও সঠিক দৈনিক ইসলামি সরঞ্জাম প্রদান করা।</p>
<h2>আমাদের লক্ষ্য</h2>
<p>আমরা বিশ্বাস করি দৈনিক ধর্মীয় সরঞ্জামগুলো হওয়া উচিত:</p>
<ul>
<li><strong>বিনামূল্যে:</strong> ইসলাম সবার জন্য, এবং এর সরঞ্জামগুলো সাবস্ক্রিপশনের পিছনে লুকানো উচিত নয়।</li>
<li><strong>নির্ভুল:</strong> আমরা সর্বশেষ জ্যোতির্বিদ্যার সমীকরণ এবং নির্ভরযোগ্য ধর্মীয় উৎসের উপর নির্ভর করি।</li>
<li><strong>দ্রুত ও হালকা:</strong> সাইটটি সবচেয়ে ধীর সংযোগ ও পুরানো ডিভাইসেও কাজ করে।</li>
<li><strong>গোপনীয়তার প্রতি শ্রদ্ধাশীল:</strong> কোনো নিবন্ধন প্রয়োজন নেই, এবং আমরা আমাদের সার্ভারে আপনার ডেটা সংরক্ষণ করি না।</li>
</ul>
<h2>প্রধান বৈশিষ্ট্যসমূহ</h2>
<ul>
<li><strong>নামাজের সময়:</strong> ফজর, জোহর, আসর, মাগরিব, এশা — বিশ্বের প্রতিটি শহরের জন্য, সাপ্তাহিক সময়সূচী এবং প্রতিটি নামাজের আগে রিমাইন্ডার সহ।</li>
<li><strong>কিবলার দিক:</strong> ইন্টারঅ্যাকটিভ কম্পাস ও মানচিত্র যা আপনার অবস্থান থেকে কাবার দিক সঠিকভাবে দেখায়।</li>
<li><strong>হিজরি ক্যালেন্ডার:</strong> ১ হিজরি থেকে ১৫০০ হিজরি পর্যন্ত সম্পূর্ণ ক্যালেন্ডার এবং হিজরি ↔ খ্রিস্টীয় রূপান্তরকারী।</li>
<li><strong>দোয়া ও জিকির:</strong> কুরআন ও সুন্নাহ থেকে সুসংগঠিত সংগ্রহ (সকাল, সন্ধ্যা, নামাজ, ঘুম, ভ্রমণ…)।</li>
<li><strong>ডিজিটাল তাসবিহ:</strong> কাউন্টার যা আপনার অগ্রগতি সংরক্ষণ করে এবং দৈনিক লক্ষ্য সমর্থন করে।</li>
<li><strong>যাকাত ক্যালকুলেটর:</strong> নগদ, স্বর্ণ, রূপা, শেয়ার ও বিনিয়োগ অন্তর্ভুক্ত।</li>
<li><strong>শহরের পৃষ্ঠা:</strong> বিশ্বের বিভিন্ন শহরের জন্য হাজার হাজার পৃষ্ঠা, প্রতিটির সঙ্গে ভৌগোলিক তথ্য ও সঠিক সময়।</li>
</ul>
<h2>আমরা কীভাবে নামাজের সময় গণনা করি?</h2>
<p>আমরা প্রধান গণনা পদ্ধতিগুলোর সমর্থন সহ আন্তর্জাতিকভাবে স্বীকৃত জ্যোতির্বিদ্যার অ্যালগরিদম ব্যবহার করি:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>বিশ্ব মুসলিম লিগ (MWL)</li>
<li>মিশরীয় সাধারণ জরিপ কর্তৃপক্ষ</li>
<li>উম্মুল কুরা — সৌদি আরব</li>
<li>ইসলামি বিজ্ঞান বিশ্ববিদ্যালয়, করাচি</li>
</ul>
<h2>সমর্থিত ভাষা</h2>
<p>সাইটটি বর্তমানে <strong>আরবি</strong>, <strong>ইংরেজি</strong>, <strong>ফরাসি</strong>, <strong>তুর্কি</strong>, <strong>উর্দু</strong>, <strong>জার্মান</strong>, <strong>ইন্দোনেশীয়</strong>, <strong>স্প্যানিশ</strong>, <strong>বাংলা</strong> এবং <strong>মালয়</strong> ভাষায় উপলব্ধ।</p>
<h2>দল</h2>
<p>এই সাইটটি একটি স্বেচ্ছাসেবী প্রকল্প যা তাদের উম্মাহকে ভালোবাসেন এবং সেরা প্রযুক্তি দিয়ে সেবা করতে চান এমন মুসলিমদের দ্বারা পরিচালিত। আমরা ডেভেলপার, ডিজাইনার ও অনুবাদকদের স্বাগত জানাই — আমাদের <a href="/bn/contact">যোগাযোগ পৃষ্ঠা</a>-র মাধ্যমে যোগাযোগ করুন।</p>
<h2>এই সাইটটি কীভাবে অর্থায়িত হয়?</h2>
<p>সাইটটি সম্পূর্ণ বিনামূল্যে। সার্ভার ও উন্নয়ন খরচ বহনের জন্য আমরা Google AdSense আয়ের (পরিকল্পিত) উপর নির্ভর করি। আমরা কখনও বিঘ্নকারী বিজ্ঞাপন বা আমাদের ইসলামি মূল্যবোধের বিরুদ্ধে যায় এমন কোনো কন্টেন্ট দেখাব না।</p>`,
        ms: `<h1>Tentang Waktu Solat</h1>
<p><strong>Waktu Solat</strong> ialah projek Islam percuma yang bertujuan menyediakan alat Islam harian yang boleh dipercayai dan tepat untuk setiap Muslim di seluruh dunia — di mana-mana bandar, dalam apa-apa bahasa dan pada apa-apa peranti.</p>
<h2>Misi Kami</h2>
<p>Kami percaya alat keagamaan harian mestilah:</p>
<ul>
<li><strong>Percuma:</strong> Islam untuk semua, dan alatnya tidak sepatutnya tersembunyi di sebalik langganan.</li>
<li><strong>Tepat:</strong> kami bergantung pada persamaan astronomi terkini dan sumber keagamaan yang boleh dipercayai.</li>
<li><strong>Pantas dan ringan:</strong> laman ini berfungsi pada sambungan paling perlahan dan peranti paling lama.</li>
<li><strong>Menghormati privasi:</strong> tiada pendaftaran diperlukan, dan kami tidak menyimpan data anda di pelayan kami.</li>
</ul>
<h2>Ciri-ciri Utama</h2>
<ul>
<li><strong>Waktu Solat:</strong> Subuh, Zohor, Asar, Maghrib, Isyak — untuk setiap bandar di dunia, dengan jadual mingguan dan peringatan sebelum setiap solat.</li>
<li><strong>Arah Kiblat:</strong> kompas interaktif dan peta yang menunjukkan arah Kaabah dengan tepat dari lokasi anda.</li>
<li><strong>Kalendar Hijrah:</strong> kalendar penuh dari tahun 1 H hingga 1500 H serta penukar Hijrah ↔ Masihi.</li>
<li><strong>Doa dan zikir:</strong> koleksi tersusun dari Al-Quran dan Sunnah (pagi, petang, solat, tidur, perjalanan…).</li>
<li><strong>Tasbih Digital:</strong> kaunter yang menyimpan kemajuan anda dan menyokong sasaran harian.</li>
<li><strong>Kalkulator Zakat:</strong> merangkumi tunai, emas, perak, saham dan pelaburan.</li>
<li><strong>Halaman bandar:</strong> beribu-ribu halaman untuk bandar di seluruh dunia, setiap satu dengan maklumat geografi dan waktu yang tepat.</li>
</ul>
<h2>Bagaimana Kami Mengira Waktu Solat?</h2>
<p>Kami menggunakan algoritma astronomi yang diiktiraf di peringkat antarabangsa dengan sokongan untuk mazhab pengiraan utama:</p>
<ul>
<li>Islamic Society of North America (ISNA)</li>
<li>Liga Dunia Muslim (MWL)</li>
<li>Pihak Berkuasa Umum Ukur Mesir</li>
<li>Umm al-Qura — Arab Saudi</li>
<li>Universiti Sains Islam, Karachi</li>
</ul>
<h2>Bahasa yang Disokong</h2>
<p>Laman ini kini tersedia dalam bahasa <strong>Arab</strong>, <strong>Inggeris</strong>, <strong>Perancis</strong>, <strong>Turki</strong>, <strong>Urdu</strong>, <strong>Jerman</strong>, <strong>Indonesia</strong>, <strong>Sepanyol</strong>, <strong>Benggali</strong> dan <strong>Melayu</strong>.</p>
<h2>Pasukan</h2>
<p>Laman ini ialah projek sukarela yang dikendalikan oleh umat Islam yang mencintai umat mereka dan berhasrat untuk berkhidmat dengan teknologi terbaik. Kami mengalu-alukan pembangun, pereka bentuk dan penterjemah — hubungi kami melalui <a href="/ms/contact">halaman hubungi</a>.</p>
<h2>Bagaimana Laman Ini Dibiayai?</h2>
<p>Laman ini percuma sepenuhnya. Kami bergantung pada hasil Google AdSense (dirancang) untuk menampung kos pelayan dan pembangunan. Kami tidak akan memaparkan iklan yang mengganggu atau sebarang kandungan yang bertentangan dengan nilai Islam kami.</p>`
    }
};

// ============================================================
// ===== SSR SEO: server-side meta injection for HTML pages ===
// ============================================================

// أسماء الدول بالعربية (للـ SSR — يجب أن تطابق ما في prayer-times-cities.html)
const COUNTRY_NAMES_AR = {
    sa:'المملكة العربية السعودية', sy:'سوريا', eg:'مصر', iq:'العراق',
    jo:'الأردن', lb:'لبنان', ps:'فلسطين', kw:'الكويت', ae:'الإمارات',
    qa:'قطر', bh:'البحرين', om:'عُمان', ye:'اليمن', ly:'ليبيا',
    tn:'تونس', dz:'الجزائر', ma:'المغرب', sd:'السودان',
    dj:'جيبوتي', km:'جزر القمر',
    pk:'باكستان', tr:'تركيا', ir:'إيران', id:'إندونيسيا', my:'ماليزيا',
    bd:'بنغلاديش', af:'أفغانستان', in:'الهند', lk:'سريلانكا', np:'نيبال',
    cn:'الصين', jp:'اليابان', kr:'كوريا الجنوبية', kp:'كوريا الشمالية', mn:'منغوليا',
    fr:'فرنسا', de:'ألمانيا', gb:'المملكة المتحدة', es:'إسبانيا', it:'إيطاليا',
    nl:'هولندا', be:'بلجيكا', pt:'البرتغال', se:'السويد', no:'النرويج',
    dk:'الدنمارك', fi:'فنلندا', pl:'بولندا', ru:'روسيا', ua:'أوكرانيا',
    ch:'سويسرا', at:'النمسا', gr:'اليونان', cz:'التشيك', ro:'رومانيا',
    us:'الولايات المتحدة', ca:'كندا', mx:'المكسيك',
    gt:'غواتيمالا', cu:'كوبا', do:'الدومينيكان',
    br:'البرازيل', ar:'الأرجنتين', co:'كولومبيا', pe:'بيرو', ve:'فنزويلا',
    cl:'تشيلي', ec:'الإكوادور', bo:'بوليفيا', py:'باراغواي', uy:'أوروغواي',
    ng:'نيجيريا', et:'إثيوبيا', ke:'كينيا', tz:'تنزانيا', za:'جنوب أفريقيا',
    gh:'غانا', sn:'السنغال', cm:'الكاميرون', ml:'مالي', so:'الصومال',
    ug:'أوغندا', mr:'موريتانيا', td:'تشاد', ne:'النيجر',
    au:'أستراليا', nz:'نيوزيلندا',
    th:'تايلاند', ph:'الفلبين', vn:'فيتنام', mm:'ميانمار',
    kh:'كمبوديا', la:'لاوس', sg:'سنغافورة', bn:'بروناي', tl:'تيمور الشرقية',
    uz:'أوزبكستان', kz:'كازاخستان', kg:'قيرغيزستان', tj:'طاجيكستان',
    tm:'تركمانستان', az:'أذربيجان', ge:'جورجيا', am:'أرمينيا',
    xk:'كوسوفو',
    // Round 7k — توسّع: 40 دولة إضافية
    ba:'البوسنة والهرسك', al:'ألبانيا', mk:'مقدونيا الشمالية',
    bf:'بوركينا فاسو', ci:'ساحل العاج', gn:'غينيا', gm:'غامبيا',
    sl:'سيراليون', mv:'المالديف', er:'إريتريا', ss:'جنوب السودان',
    tg:'توغو', bj:'بنين',
    ie:'أيرلندا', hu:'المجر', hr:'كرواتيا', rs:'صربيا',
    bg:'بلغاريا', si:'سلوفينيا', sk:'سلوفاكيا',
    mg:'مدغشقر', mz:'موزمبيق', ao:'أنغولا', cd:'جمهورية الكونغو الديمقراطية',
    rw:'رواندا', zw:'زيمبابوي', zm:'زامبيا', mu:'موريشيوس',
    lr:'ليبيريا', mw:'مالاوي',
    sr:'سورينام', gy:'غيانا', tt:'ترينيداد وتوباغو', jm:'جامايكا',
    pa:'بنما', ht:'هايتي', cr:'كوستاريكا',
    bt:'بوتان', fj:'فيجي', pg:'بابوا غينيا الجديدة',
    // دول-المدن والمايكروستيتس
    mc:'موناكو', sm:'سان مارينو', va:'الفاتيكان', ad:'أندورا',
    li:'ليختنشتاين', lu:'لوكسمبورغ', mt:'مالطا',
};

// أشهر الهجرية (slug → {ar, en, order})
const _HIJRI_MONTHS = {
    'muharram':        { ar: 'محرم',            en: 'Muharram',         order: 1 },
    'safar':           { ar: 'صفر',             en: 'Safar',            order: 2 },
    'rabi-al-awwal':   { ar: 'ربيع الأول',      en: "Rabi' al-Awwal",   order: 3 },
    'rabi-al-thani':   { ar: 'ربيع الآخر',       en: "Rabi' al-Thani",   order: 4 },
    'jumada-al-ula':   { ar: 'جمادى الأولى',    en: 'Jumada al-Ula',    order: 5 },
    'jumada-al-akhira':{ ar: 'جمادى الآخرة',    en: 'Jumada al-Akhira', order: 6 },
    'rajab':           { ar: 'رجب',             en: 'Rajab',            order: 7 },
    'shaban':          { ar: 'شعبان',           en: "Sha'ban",          order: 8 },
    'ramadan':         { ar: 'رمضان',           en: 'Ramadan',          order: 9 },
    'shawwal':         { ar: 'شوال',            en: 'Shawwal',          order: 10 },
    'dhu-al-qidah':    { ar: 'ذو القعدة',        en: "Dhu al-Qi'dah",    order: 11 },
    'dhu-al-hijjah':   { ar: 'ذو الحجة',         en: 'Dhu al-Hijjah',    order: 12 },
};
const _HIJRI_MONTHS_BY_ORDER = Object.keys(_HIJRI_MONTHS).reduce((m, k) => {
    m[_HIJRI_MONTHS[k].order] = k;
    return m;
}, {});

// الشهر الميلادي (لـ SSR تحسين keyword consistency: "أبريل 2026" إلخ)
const _GREG_MONTHS = {
    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
};

/**
 * يحوّل التاريخ الميلادي الحالي إلى هجري (خوارزمية كويتية — دقّة ±1 يوم).
 * يُستخدم لحقن الشهر/السنة الهجرية في SSR (keyword consistency: "شوال 1447").
 * Returns: { year, month, day } — month هو index 1..12.
 */
// Hijri date — نفس خوارزمية js/hijri-date.js (لضمان تطابق SSR مع client-side calculation)
function _gregToJD(year, month, day) {
    if (month <= 2) { year--; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524;
}
function _hijriToJD(year, month, day) {
    return Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month
        - Math.floor((month - 1) / 2) + day + 1948440 - 385;
}
function _jdToHijri(jd) {
    jd = Math.floor(jd) + 0.5;
    const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
    const month = Math.min(12, Math.ceil((jd - (29 + _hijriToJD(year, 1, 1))) / 29.5) + 1);
    const day = jd - _hijriToJD(year, month, 1) + 1;
    return { year: year, month: Math.max(1, month), day: Math.max(1, Math.floor(day)) };
}
function _hijriNow() {
    const now = new Date();
    const jd = _gregToJD(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return _jdToHijri(jd);
}

function _escHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _slugToTitle(slug) {
    return (slug || '').split('-').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// يأخذ slug دولة (مثل 'saudi-arabia') ويعيد {cc, nameAr, nameEn}
function _countryFromSlug(slug) {
    for (const cc in COUNTRY_NAMES_EN) {
        const s = makeCountrySlugSrv(cc);
        if (s === slug) return { cc, nameAr: COUNTRY_NAMES_AR[cc] || COUNTRY_NAMES_EN[cc], nameEn: COUNTRY_NAMES_EN[cc] };
    }
    // لم يُطابق دولة — نُرجِع '__' كإشارة sentinel ليتمكّن المُستدعون من التمييز
    // بين دولة حقيقية (cc من ISO) وslug مدينة (fallback). كل المُستدعين يفحصون cc !== '__'.
    const fallback = _slugToTitle(slug);
    return { cc: '__', nameAr: fallback, nameEn: fallback };
}

// ============================================================
// صفحة /countries: قائمة كل دول العالم مع أعلامها، مجموعة حسب المنطقة
// ============================================================
const _COUNTRIES_REGIONS = {
    arab:     ['sa','eg','ae','iq','sy','jo','ps','lb','ye','om','kw','qa','bh','ma','dz','tn','ly','sd','mr','so','dj','km'],
    asia:     ['tr','ir','pk','af','in','bd','id','my','sg','bn','ph','th','vn','kh','la','tl','cn','jp','kr','kp','mn','kz','uz','az','lk','np','mm','kg','tj','tm','ge','am','mv','bt'],
    africa:   ['ng','et','ke','tz','za','gh','sn','cm','ml','ug','td','ne','bf','ci','gn','gm','sl','er','ss','tg','bj','mg','mz','ao','cd','rw','zw','zm','mu','lr','mw'],
    europe:   ['fr','de','gb','nl','be','es','it','pt','se','no','dk','fi','ch','at','gr','cz','ro','pl','ru','ua','xk','ba','al','mk','ie','hu','hr','rs','bg','si','sk'],
    americas: ['us','ca','mx','gt','cu','do','br','ar','co','pe','ve','cl','ec','bo','py','uy','sr','gy','tt','jm','pa','ht','cr'],
    oceania:  ['au','nz','fj','pg'],
};

const _REGION_TITLES = {
    arab:     { ar:'🕌 الدول العربية',   en:'🕌 Arab Countries',    fr:'🕌 Pays arabes',       tr:'🕌 Arap Ülkeleri',       ur:'🕌 عرب ممالک',        de:'🕌 Arabische Länder',  id:'🕌 Negara-Negara Arab', es:'🕌 Países Árabes',     bn:'🕌 আরব দেশসমূহ',          ms:'🕌 Negara Arab' },
    asia:     { ar:'🌏 آسيا',              en:'🌏 Asia',              fr:'🌏 Asie',              tr:'🌏 Asya',                ur:'🌏 ایشیا',             de:'🌏 Asien',              id:'🌏 Asia',               es:'🌏 Asia',              bn:'🌏 এশিয়া',                 ms:'🌏 Asia' },
    africa:   { ar:'🌍 أفريقيا',           en:'🌍 Africa',            fr:'🌍 Afrique',           tr:'🌍 Afrika',              ur:'🌍 افریقہ',            de:'🌍 Afrika',             id:'🌍 Afrika',             es:'🌍 África',            bn:'🌍 আফ্রিকা',                ms:'🌍 Afrika' },
    europe:   { ar:'🌍 أوروبا',            en:'🌍 Europe',            fr:'🌍 Europe',            tr:'🌍 Avrupa',              ur:'🌍 یورپ',              de:'🌍 Europa',             id:'🌍 Eropa',              es:'🌍 Europa',            bn:'🌍 ইউরোপ',                  ms:'🌍 Eropah' },
    americas: { ar:'🌎 الأمريكتان',        en:'🌎 The Americas',      fr:'🌎 Amériques',         tr:'🌎 Amerika Kıtası',      ur:'🌎 امریکہ',            de:'🌎 Amerika',            id:'🌎 Benua Amerika',      es:'🌎 Las Américas',      bn:'🌎 আমেরিকা মহাদেশ',         ms:'🌎 Benua Amerika' },
    oceania:  { ar:'🌏 أوقيانوسيا',        en:'🌏 Oceania',           fr:'🌏 Océanie',           tr:'🌏 Okyanusya',           ur:'🌏 اوشیانیا',          de:'🌏 Ozeanien',           id:'🌏 Oseania',            es:'🌏 Oceanía',           bn:'🌏 ওশেনিয়া',               ms:'🌏 Oceania' },
};

// ترجمات أسماء الدول لغير العربية (لغير AR — نعتمد على COUNTRY_NAMES_EN كأساس،
// ونضيف ترجمات لـ fr/tr/ur للدول العربية + الكبرى لجعلها localized)
const _COUNTRY_NAMES_FR = {
    sa:'Arabie Saoudite', eg:'Égypte', ae:'Émirats arabes unis', iq:'Irak', sy:'Syrie',
    jo:'Jordanie', ps:'Palestine', lb:'Liban', ye:'Yémen', om:'Oman',
    kw:'Koweït', qa:'Qatar', bh:'Bahreïn', ma:'Maroc', dz:'Algérie',
    tn:'Tunisie', ly:'Libye', sd:'Soudan', mr:'Mauritanie', so:'Somalie',
    dj:'Djibouti', km:'Comores',
    tr:'Turquie', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'Inde',
    bd:'Bangladesh', id:'Indonésie', my:'Malaisie', fr:'France', de:'Allemagne',
    gb:'Royaume-Uni', us:'États-Unis', ca:'Canada', mx:'Mexique', br:'Brésil',
    ru:'Russie', cn:'Chine', jp:'Japon', kr:'Corée du Sud',
    // Round 7k
    ba:'Bosnie-Herzégovine', al:'Albanie', mk:'Macédoine du Nord',
    bf:'Burkina Faso', ci:"Côte d'Ivoire", gn:'Guinée', gm:'Gambie',
    sl:'Sierra Leone', mv:'Maldives', er:'Érythrée', ss:'Soudan du Sud',
    tg:'Togo', bj:'Bénin',
    ie:'Irlande', hu:'Hongrie', hr:'Croatie', rs:'Serbie',
    bg:'Bulgarie', si:'Slovénie', sk:'Slovaquie',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'République démocratique du Congo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambie', mu:'Maurice',
    lr:'Libéria', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinité-et-Tobago', jm:'Jamaïque',
    pa:'Panama', ht:'Haïti', cr:'Costa Rica',
    bt:'Bhoutan', fj:'Fidji', pg:'Papouasie-Nouvelle-Guinée',
};
const _COUNTRY_NAMES_TR = {
    sa:'Suudi Arabistan', eg:'Mısır', ae:'BAE', iq:'Irak', sy:'Suriye',
    jo:'Ürdün', ps:'Filistin', lb:'Lübnan', ye:'Yemen', om:'Umman',
    kw:'Kuveyt', qa:'Katar', bh:'Bahreyn', ma:'Fas', dz:'Cezayir',
    tn:'Tunus', ly:'Libya', sd:'Sudan', mr:'Moritanya', so:'Somali',
    dj:'Cibuti', km:'Komorlar',
    tr:'Türkiye', ir:'İran', pk:'Pakistan', af:'Afganistan', in:'Hindistan',
    bd:'Bangladeş', id:'Endonezya', my:'Malezya', fr:'Fransa', de:'Almanya',
    gb:'Birleşik Krallık', us:'Amerika Birleşik Devletleri', ca:'Kanada', mx:'Meksika',
    br:'Brezilya', ru:'Rusya', cn:'Çin', jp:'Japonya', kr:'Güney Kore',
    // Round 7k
    ba:'Bosna Hersek', al:'Arnavutluk', mk:'Kuzey Makedonya',
    bf:'Burkina Faso', ci:'Fildişi Sahili', gn:'Gine', gm:'Gambiya',
    sl:'Sierra Leone', mv:'Maldivler', er:'Eritre', ss:'Güney Sudan',
    tg:'Togo', bj:'Benin',
    ie:'İrlanda', hu:'Macaristan', hr:'Hırvatistan', rs:'Sırbistan',
    bg:'Bulgaristan', si:'Slovenya', sk:'Slovakya',
    mg:'Madagaskar', mz:'Mozambik', ao:'Angola', cd:'Demokratik Kongo Cumhuriyeti',
    rw:'Ruanda', zw:'Zimbabve', zm:'Zambiya', mu:'Mauritius',
    lr:'Liberya', mw:'Malavi',
    sr:'Surinam', gy:'Guyana', tt:'Trinidad ve Tobago', jm:'Jamaika',
    pa:'Panama', ht:'Haiti', cr:'Kosta Rika',
    bt:'Butan', fj:'Fiji', pg:'Papua Yeni Gine',
};
const _COUNTRY_NAMES_UR = {
    sa:'سعودی عرب', eg:'مصر', ae:'متحدہ عرب امارات', iq:'عراق', sy:'شام',
    jo:'اردن', ps:'فلسطین', lb:'لبنان', ye:'یمن', om:'عمان',
    kw:'کویت', qa:'قطر', bh:'بحرین', ma:'مراکش', dz:'الجزائر',
    tn:'تیونس', ly:'لیبیا', sd:'سوڈان', mr:'موریطانیہ', so:'صومالیہ',
    dj:'جبوتی', km:'جزائرِ قمر',
    tr:'ترکی', ir:'ایران', pk:'پاکستان', af:'افغانستان', in:'بھارت',
    bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملائیشیا', fr:'فرانس', de:'جرمنی',
    gb:'برطانیہ', us:'ریاستہائے متحدہ', ca:'کینیڈا', mx:'میکسیکو',
    br:'برازیل', ru:'روس', cn:'چین', jp:'جاپان', kr:'جنوبی کوریا',
    // Round 7k
    ba:'بوسنیا و ہرزیگووینا', al:'البانیا', mk:'شمالی مقدونیہ',
    bf:'برکینا فاسو', ci:'آئیوری کوسٹ', gn:'گنی', gm:'گیمبیا',
    sl:'سیرا لیون', mv:'مالدیپ', er:'اریٹریا', ss:'جنوبی سوڈان',
    tg:'ٹوگو', bj:'بینن',
    ie:'آئرلینڈ', hu:'ہنگری', hr:'کروشیا', rs:'سربیا',
    bg:'بلغاریہ', si:'سلووینیا', sk:'سلوواکیہ',
    mg:'مڈغاسکر', mz:'موزمبیق', ao:'انگولا', cd:'جمہوری جمہوریہ کانگو',
    rw:'روانڈا', zw:'زمبابوے', zm:'زیمبیا', mu:'ماریشس',
    lr:'لائبیریا', mw:'ملاوی',
    sr:'سرینام', gy:'گیانا', tt:'ٹرینیڈاڈ اور ٹوباگو', jm:'جمیکا',
    pa:'پاناما', ht:'ہیٹی', cr:'کوسٹا ریکا',
    bt:'بھوٹان', fj:'فجی', pg:'پاپوا نیو گنی',
};
const _COUNTRY_NAMES_DE = {
    sa:'Saudi-Arabien', eg:'Ägypten', ae:'Vereinigte Arabische Emirate', iq:'Irak', sy:'Syrien',
    jo:'Jordanien', ps:'Palästina', lb:'Libanon', ye:'Jemen', om:'Oman',
    kw:'Kuwait', qa:'Katar', bh:'Bahrain', ma:'Marokko', dz:'Algerien',
    tn:'Tunesien', ly:'Libyen', sd:'Sudan', mr:'Mauretanien', so:'Somalia',
    dj:'Dschibuti', km:'Komoren',
    tr:'Türkei', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'Indien',
    bd:'Bangladesch', id:'Indonesien', my:'Malaysia', fr:'Frankreich', de:'Deutschland',
    gb:'Vereinigtes Königreich', us:'Vereinigte Staaten', ca:'Kanada', mx:'Mexiko',
    br:'Brasilien', ru:'Russland', cn:'China', jp:'Japan', kr:'Südkorea',
    // Round 7k
    ba:'Bosnien und Herzegowina', al:'Albanien', mk:'Nordmazedonien',
    bf:'Burkina Faso', ci:'Elfenbeinküste', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Malediven', er:'Eritrea', ss:'Südsudan',
    tg:'Togo', bj:'Benin',
    ie:'Irland', hu:'Ungarn', hr:'Kroatien', rs:'Serbien',
    bg:'Bulgarien', si:'Slowenien', sk:'Slowakei',
    mg:'Madagaskar', mz:'Mosambik', ao:'Angola', cd:'Demokratische Republik Kongo',
    rw:'Ruanda', zw:'Simbabwe', zm:'Sambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad und Tobago', jm:'Jamaika',
    pa:'Panama', ht:'Haiti', cr:'Costa Rica',
    bt:'Bhutan', fj:'Fidschi', pg:'Papua-Neuguinea',
    // Extras (most common European and other countries from COUNTRY_NAMES_EN baseline)
    nl:'Niederlande', be:'Belgien', es:'Spanien', it:'Italien', pt:'Portugal',
    se:'Schweden', no:'Norwegen', dk:'Dänemark', fi:'Finnland', ch:'Schweiz',
    at:'Österreich', gr:'Griechenland', cz:'Tschechien', ro:'Rumänien', pl:'Polen',
    ua:'Ukraine', xk:'Kosovo',
    sg:'Singapur', bn:'Brunei', ph:'Philippinen', th:'Thailand', vn:'Vietnam',
    kh:'Kambodscha', la:'Laos', tl:'Osttimor', kp:'Nordkorea', mn:'Mongolei',
    kz:'Kasachstan', uz:'Usbekistan', az:'Aserbaidschan', lk:'Sri Lanka', np:'Nepal',
    mm:'Myanmar', kg:'Kirgisistan', tj:'Tadschikistan', tm:'Turkmenistan',
    ge:'Georgien', am:'Armenien',
    ng:'Nigeria', et:'Äthiopien', ke:'Kenia', tz:'Tansania', za:'Südafrika',
    gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali', ug:'Uganda',
    td:'Tschad', ne:'Niger',
    au:'Australien', nz:'Neuseeland',
    gt:'Guatemala', cu:'Kuba', do:'Dominikanische Republik',
    ar:'Argentinien', co:'Kolumbien', pe:'Peru', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivien', py:'Paraguay', uy:'Uruguay',
};
const _COUNTRY_NAMES_ID = {
    sa:'Arab Saudi', eg:'Mesir', ae:'Uni Emirat Arab', iq:'Irak', sy:'Suriah',
    jo:'Yordania', ps:'Palestina', lb:'Lebanon', ye:'Yaman', om:'Oman',
    kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maroko', dz:'Aljazair',
    tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
    dj:'Djibouti', km:'Komoro',
    tr:'Turki', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'India',
    bd:'Bangladesh', id:'Indonesia', my:'Malaysia', fr:'Prancis', de:'Jerman',
    gb:'Britania Raya', us:'Amerika Serikat', ca:'Kanada', mx:'Meksiko',
    br:'Brasil', ru:'Rusia', cn:'Tiongkok', jp:'Jepang', kr:'Korea Selatan',
    // Round 7k
    ba:'Bosnia dan Herzegovina', al:'Albania', mk:'Makedonia Utara',
    bf:'Burkina Faso', ci:'Pantai Gading', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Maladewa', er:'Eritrea', ss:'Sudan Selatan',
    tg:'Togo', bj:'Benin',
    ie:'Irlandia', hu:'Hungaria', hr:'Kroasia', rs:'Serbia',
    bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagaskar', mz:'Mozambik', ao:'Angola', cd:'Republik Demokratik Kongo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad dan Tobago', jm:'Jamaika',
    pa:'Panama', ht:'Haiti', cr:'Kosta Rika',
    bt:'Bhutan', fj:'Fiji', pg:'Papua Nugini',
    // Extras
    nl:'Belanda', be:'Belgia', es:'Spanyol', it:'Italia', pt:'Portugal',
    se:'Swedia', no:'Norwegia', dk:'Denmark', fi:'Finlandia', ch:'Swiss',
    at:'Austria', gr:'Yunani', cz:'Ceko', ro:'Rumania', pl:'Polandia',
    ua:'Ukraina', xk:'Kosovo',
    sg:'Singapura', bn:'Brunei', ph:'Filipina', th:'Thailand', vn:'Vietnam',
    kh:'Kamboja', la:'Laos', tl:'Timor Leste', kp:'Korea Utara', mn:'Mongolia',
    kz:'Kazakhstan', uz:'Uzbekistan', az:'Azerbaijan', lk:'Sri Lanka', np:'Nepal',
    mm:'Myanmar', kg:'Kirgizstan', tj:'Tajikistan', tm:'Turkmenistan',
    ge:'Georgia', am:'Armenia',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania', za:'Afrika Selatan',
    gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali', ug:'Uganda',
    td:'Chad', ne:'Niger',
    au:'Australia', nz:'Selandia Baru',
    gt:'Guatemala', cu:'Kuba', do:'Republik Dominika',
    ar:'Argentina', co:'Kolombia', pe:'Peru', ve:'Venezuela',
    cl:'Chili', ec:'Ekuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
};
const _COUNTRY_NAMES_ES = {
    sa:'Arabia Saudita', eg:'Egipto', ae:'Emiratos Árabes Unidos', iq:'Irak', sy:'Siria',
    jo:'Jordania', ps:'Palestina', lb:'Líbano', ye:'Yemen', om:'Omán',
    kw:'Kuwait', qa:'Catar', bh:'Baréin', ma:'Marruecos', dz:'Argelia',
    tn:'Túnez', ly:'Libia', sd:'Sudán', mr:'Mauritania', so:'Somalia',
    dj:'Yibuti', km:'Comoras',
    tr:'Turquía', ir:'Irán', pk:'Pakistán', af:'Afganistán', in:'India',
    bd:'Bangladés', id:'Indonesia', my:'Malasia', fr:'Francia', de:'Alemania',
    gb:'Reino Unido', us:'Estados Unidos', ca:'Canadá', mx:'México',
    br:'Brasil', ru:'Rusia', cn:'China', jp:'Japón', kr:'Corea del Sur',
    ba:'Bosnia y Herzegovina', al:'Albania', mk:'Macedonia del Norte',
    bf:'Burkina Faso', ci:'Costa de Marfil', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leona', mv:'Maldivas', er:'Eritrea', ss:'Sudán del Sur',
    tg:'Togo', bj:'Benín',
    ie:'Irlanda', hu:'Hungría', hr:'Croacia', rs:'Serbia',
    bg:'Bulgaria', si:'Eslovenia', sk:'Eslovaquia',
    mg:'Madagascar', mz:'Mozambique', ao:'Angola', cd:'República Democrática del Congo',
    rw:'Ruanda', zw:'Zimbabue', zm:'Zambia', mu:'Mauricio',
    lr:'Liberia', mw:'Malaui',
    sr:'Surinam', gy:'Guyana', tt:'Trinidad y Tobago', jm:'Jamaica',
    pa:'Panamá', ht:'Haití', cr:'Costa Rica',
    bt:'Bután', fj:'Fiyi', pg:'Papúa Nueva Guinea',
    nl:'Países Bajos', be:'Bélgica', es:'España', it:'Italia', pt:'Portugal',
    se:'Suecia', no:'Noruega', dk:'Dinamarca', fi:'Finlandia', ch:'Suiza',
    at:'Austria', gr:'Grecia', cz:'Chequia', ro:'Rumanía', pl:'Polonia',
    ua:'Ucrania', xk:'Kosovo',
    sg:'Singapur', bn:'Brunéi', ph:'Filipinas', th:'Tailandia', vn:'Vietnam',
    kh:'Camboya', la:'Laos', tl:'Timor Oriental', kp:'Corea del Norte', mn:'Mongolia',
    kz:'Kazajistán', uz:'Uzbekistán', az:'Azerbaiyán', lk:'Sri Lanka', np:'Nepal',
    mm:'Birmania', kg:'Kirguistán', tj:'Tayikistán', tm:'Turkmenistán',
    ge:'Georgia', am:'Armenia',
    ng:'Nigeria', et:'Etiopía', ke:'Kenia', tz:'Tanzania', za:'Sudáfrica',
    gh:'Ghana', sn:'Senegal', cm:'Camerún', ml:'Malí', ug:'Uganda',
    td:'Chad', ne:'Níger',
    au:'Australia', nz:'Nueva Zelanda',
    gt:'Guatemala', cu:'Cuba', do:'República Dominicana',
    ar:'Argentina', co:'Colombia', pe:'Perú', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
};
const _COUNTRY_NAMES_BN = {
    sa:'সৌদি আরব', eg:'মিশর', ae:'সংযুক্ত আরব আমিরাত', iq:'ইরাক', sy:'সিরিয়া',
    jo:'জর্ডান', ps:'ফিলিস্তিন', lb:'লেবানন', ye:'ইয়েমেন', om:'ওমান',
    kw:'কুয়েত', qa:'কাতার', bh:'বাহরাইন', ma:'মরক্কো', dz:'আলজেরিয়া',
    tn:'তিউনিসিয়া', ly:'লিবিয়া', sd:'সুদান', mr:'মৌরিতানিয়া', so:'সোমালিয়া',
    dj:'জিবুতি', km:'কোমোরোস',
    tr:'তুরস্ক', ir:'ইরান', pk:'পাকিস্তান', af:'আফগানিস্তান', in:'ভারত',
    bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া', fr:'ফ্রান্স', de:'জার্মানি',
    gb:'যুক্তরাজ্য', us:'যুক্তরাষ্ট্র', ca:'কানাডা', mx:'মেক্সিকো',
    br:'ব্রাজিল', ru:'রাশিয়া', cn:'চীন', jp:'জাপান', kr:'দক্ষিণ কোরিয়া',
    ba:'বসনিয়া ও হার্জেগোভিনা', al:'আলবেনিয়া', mk:'উত্তর মেসিডোনিয়া',
    bf:'বুরকিনা ফাসো', ci:'আইভরি কোস্ট', gn:'গিনি', gm:'গাম্বিয়া',
    sl:'সিয়েরা লিওন', mv:'মালদ্বীপ', er:'ইরিত্রিয়া', ss:'দক্ষিণ সুদান',
    tg:'টোগো', bj:'বেনিন',
    ie:'আয়ারল্যান্ড', hu:'হাঙ্গেরি', hr:'ক্রোয়েশিয়া', rs:'সার্বিয়া',
    bg:'বুলগেরিয়া', si:'স্লোভেনিয়া', sk:'স্লোভাকিয়া',
    mg:'মাদাগাস্কার', mz:'মোজাম্বিক', ao:'অ্যাঙ্গোলা', cd:'কঙ্গো (ডিআর)',
    rw:'রুয়ান্ডা', zw:'জিম্বাবুয়ে', zm:'জাম্বিয়া', mu:'মরিশাস',
    lr:'লাইবেরিয়া', mw:'মালাউই',
    sr:'সুরিনাম', gy:'গায়ানা', tt:'ত্রিনিদাদ ও টোবাগো', jm:'জ্যামাইকা',
    pa:'পানামা', ht:'হাইতি', cr:'কোস্টা রিকা',
    bt:'ভুটান', fj:'ফিজি', pg:'পাপুয়া নিউ গিনি',
    nl:'নেদারল্যান্ডস', be:'বেলজিয়াম', es:'স্পেন', it:'ইতালি', pt:'পর্তুগাল',
    se:'সুইডেন', no:'নরওয়ে', dk:'ডেনমার্ক', fi:'ফিনল্যান্ড', ch:'সুইজারল্যান্ড',
    at:'অস্ট্রিয়া', gr:'গ্রিস', cz:'চেক প্রজাতন্ত্র', ro:'রোমানিয়া', pl:'পোল্যান্ড',
    ua:'ইউক্রেন', xk:'কসোভো',
    sg:'সিঙ্গাপুর', bn:'ব্রুনাই', ph:'ফিলিপাইন', th:'থাইল্যান্ড', vn:'ভিয়েতনাম',
    kh:'কম্বোডিয়া', la:'লাওস', tl:'পূর্ব তিমুর', kp:'উত্তর কোরিয়া', mn:'মঙ্গোলিয়া',
    kz:'কাজাখস্তান', uz:'উজবেকিস্তান', az:'আজারবাইজান', lk:'শ্রীলঙ্কা', np:'নেপাল',
    mm:'মিয়ানমার', kg:'কিরগিজস্তান', tj:'তাজিকিস্তান', tm:'তুর্কমেনিস্তান',
    ge:'জর্জিয়া', am:'আর্মেনিয়া',
    ng:'নাইজেরিয়া', et:'ইথিওপিয়া', ke:'কেনিয়া', tz:'তানজানিয়া', za:'দক্ষিণ আফ্রিকা',
    gh:'ঘানা', sn:'সেনেগাল', cm:'ক্যামেরুন', ml:'মালি', ug:'উগান্ডা',
    td:'চাদ', ne:'নাইজার',
    au:'অস্ট্রেলিয়া', nz:'নিউজিল্যান্ড',
    gt:'গুয়াতেমালা', cu:'কিউবা', do:'ডোমিনিকান প্রজাতন্ত্র',
    ar:'আর্জেন্টিনা', co:'কলম্বিয়া', pe:'পেরু', ve:'ভেনেজুয়েলা',
    cl:'চিলি', ec:'ইকুয়েডর', bo:'বলিভিয়া', py:'প্যারাগুয়ে', uy:'উরুগুয়ে',
};
const _COUNTRY_NAMES_MS = {
    sa:'Arab Saudi', eg:'Mesir', ae:'Emiriah Arab Bersatu', iq:'Iraq', sy:'Syria',
    jo:'Jordan', ps:'Palestin', lb:'Lubnan', ye:'Yaman', om:'Oman',
    kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maghribi', dz:'Algeria',
    tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
    dj:'Djibouti', km:'Komoros',
    tr:'Turki', ir:'Iran', pk:'Pakistan', af:'Afghanistan', in:'India',
    bd:'Bangladesh', id:'Indonesia', my:'Malaysia', fr:'Perancis', de:'Jerman',
    gb:'United Kingdom', us:'Amerika Syarikat', ca:'Kanada', mx:'Mexico',
    br:'Brazil', ru:'Rusia', cn:'China', jp:'Jepun', kr:'Korea Selatan',
    ba:'Bosnia dan Herzegovina', al:'Albania', mk:'Macedonia Utara',
    bf:'Burkina Faso', ci:'Pantai Gading', gn:'Guinea', gm:'Gambia',
    sl:'Sierra Leone', mv:'Maldives', er:'Eritrea', ss:'Sudan Selatan',
    tg:'Togo', bj:'Benin',
    ie:'Ireland', hu:'Hungary', hr:'Croatia', rs:'Serbia',
    bg:'Bulgaria', si:'Slovenia', sk:'Slovakia',
    mg:'Madagaskar', mz:'Mozambique', ao:'Angola', cd:'Republik Demokratik Kongo',
    rw:'Rwanda', zw:'Zimbabwe', zm:'Zambia', mu:'Mauritius',
    lr:'Liberia', mw:'Malawi',
    sr:'Suriname', gy:'Guyana', tt:'Trinidad dan Tobago', jm:'Jamaica',
    pa:'Panama', ht:'Haiti', cr:'Costa Rica',
    bt:'Bhutan', fj:'Fiji', pg:'Papua New Guinea',
    nl:'Belanda', be:'Belgium', es:'Sepanyol', it:'Itali', pt:'Portugal',
    se:'Sweden', no:'Norway', dk:'Denmark', fi:'Finland', ch:'Switzerland',
    at:'Austria', gr:'Greece', cz:'Republik Czech', ro:'Romania', pl:'Poland',
    ua:'Ukraine', xk:'Kosovo',
    sg:'Singapura', bn:'Brunei', ph:'Filipina', th:'Thailand', vn:'Vietnam',
    kh:'Kemboja', la:'Laos', tl:'Timor-Leste', kp:'Korea Utara', mn:'Mongolia',
    kz:'Kazakhstan', uz:'Uzbekistan', az:'Azerbaijan', lk:'Sri Lanka', np:'Nepal',
    mm:'Myanmar', kg:'Kyrgyzstan', tj:'Tajikistan', tm:'Turkmenistan',
    ge:'Georgia', am:'Armenia',
    ng:'Nigeria', et:'Ethiopia', ke:'Kenya', tz:'Tanzania', za:'Afrika Selatan',
    gh:'Ghana', sn:'Senegal', cm:'Kamerun', ml:'Mali', ug:'Uganda',
    td:'Chad', ne:'Niger',
    au:'Australia', nz:'New Zealand',
    gt:'Guatemala', cu:'Cuba', do:'Republik Dominican',
    ar:'Argentina', co:'Colombia', pe:'Peru', ve:'Venezuela',
    cl:'Chile', ec:'Ecuador', bo:'Bolivia', py:'Paraguay', uy:'Uruguay',
};

// ترجمات نصوص صفحة /countries
const _COUNTRIES_PAGE_TEXTS = {
    ar: { title:'🌍 مواقيت الصلاة في دول العالم',
          intro:'اختر دولتك من القائمة أدناه لعرض جميع مدنها مع مواقيت الصلاة الدقيقة.',
          back:'← الصفحة الرئيسية',
          search:'ابحث عن دولة...',
          noResults:'⚠️ لا توجد نتائج مطابقة. جرّب بحثاً آخر.',
          metaDesc:'مواقيت الصلاة الدقيقة لكل دول العالم — اختر دولتك لعرض قائمة بجميع مدنها.',
          headerLabel:'دول العالم',
          headerSub:'مواقيت الصلاة في كل دولة',
          aboutTitle:'🌍 عن مواقيت الصلاة في دول العالم',
          aboutP1:'يوفّر موقعنا مواقيت الصلاة الخمس (الفجر، الظهر، العصر، المغرب، العشاء) لأكثر من 190 دولة حول العالم، مع تغطية شاملة لجميع الدول العربية والإسلامية ومعظم دول آسيا وأفريقيا وأوروبا والأمريكتين وأوقيانوسيا. تُحسب المواقيت بدقّة عالية بناءً على الإحداثيات الجغرافية لكلّ مدينة، وتُحدَّث يومياً تلقائياً.',
          aboutP2:'اختر دولتك من القائمة أعلاه لعرض قائمة كاملة بجميع مدنها، ثمّ اختر مدينتك للحصول على مواقيت الصلاة الدقيقة مع اتجاه القبلة والتاريخ الهجري. يمكنك أيضاً البحث مباشرة عن أيّ مدينة في العالم من الشريط العلوي.',
          faqTitle:'❓ الأسئلة الشائعة حول مواقيت الصلاة في دول العالم',
          q1:'كم عدد الدول المتوفّرة على الموقع؟',
          a1:'يوفّر الموقع مواقيت الصلاة لأكثر من 190 دولة حول العالم، تشمل جميع الدول العربية والإسلامية ومعظم دول العالم في آسيا وأفريقيا وأوروبا والأمريكتين وأوقيانوسيا.',
          q2:'هل مواقيت الصلاة دقيقة لكلّ دولة؟',
          a2:'نعم، نستخدم طرق حساب معتمدة عالمياً مثل طريقة أمّ القرى للمملكة العربية السعودية، ورابطة العالم الإسلامي لبقيّة الدول، وطريقة الهيئة المصرية العامّة لمصر، وطريقة جامعة كراتشي لباكستان، مع تحديث يوميّ تلقائيّ.',
          q3:'كيف أبحث عن دولتي؟',
          a3:'استخدم مربّع البحث في أعلى صفحة الدول للبحث باسم الدولة بأيّ لغة، أو تصفّح الدول حسب المنطقة الجغرافية: الدول العربية، آسيا، أفريقيا، أوروبا، الأمريكتين، وأوقيانوسيا.',
          q4:'ما طريقة حساب المواقيت المستخدمة؟',
          a4:'الطريقة الافتراضية تختلف حسب الدولة: أمّ القرى في السعودية، والقاهرة في مصر، وكراتشي في باكستان، ورابطة العالم الإسلامي لمعظم الدول الأخرى. يمكنك تغيير طريقة الحساب من صفحة أيّ مدينة عبر زرّ الإعدادات.',
          q5:'هل يمكنني معرفة مواقيت الصلاة لمدينة محدّدة؟',
          a5:'نعم، بعد اختيار الدولة ستظهر جميع مدنها الرئيسية مع مواقيت الصلاة لكلّ مدينة بشكل مستقلّ. كما يمكنك البحث مباشرة عن أيّ مدينة باستخدام شريط البحث في أعلى الصفحة.',
          q6:'هل الخدمة مجّانية؟ وهل تحتاج تسجيلاً؟',
          a6:'نعم، جميع الخدمات على الموقع مجّانية 100% ولا تحتاج تسجيلاً أو اشتراكاً. يمكنك استخدام الموقع بحرّية على أيّ جهاز ولأيّ عدد من المرّات.' },
    en: { title:'🌍 Prayer Times — Countries Worldwide',
          intro:'Select your country below to view all its cities with accurate prayer times.',
          back:'← Home',
          search:'Search for a country...',
          noResults:'⚠️ No matching results. Try another search.',
          metaDesc:'Accurate prayer times for countries worldwide — pick your country to see all its cities.',
          headerLabel:'World Countries',
          headerSub:'Prayer times in every country',
          aboutTitle:'🌍 About Prayer Times in World Countries',
          aboutP1:'Our site provides the five daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for more than 190 countries worldwide, with comprehensive coverage of all Arab and Islamic countries and most countries across Asia, Africa, Europe, the Americas, and Oceania. Times are calculated with high precision based on the geographic coordinates of each city and updated automatically every day.',
          aboutP2:'Select your country from the list above to view a complete list of all its cities, then choose your city to get accurate prayer times along with Qibla direction and the Hijri date. You can also search directly for any city in the world from the top search bar.',
          faqTitle:'❓ Frequently Asked Questions About Prayer Times Worldwide',
          q1:'How many countries are available on the site?',
          a1:'The site provides prayer times for more than 190 countries worldwide, covering all Arab and Islamic countries and most countries across Asia, Africa, Europe, the Americas, and Oceania.',
          q2:'Are the prayer times accurate for every country?',
          a2:'Yes, we use internationally recognized calculation methods such as Umm al-Qura for Saudi Arabia, the Muslim World League for most other countries, the Egyptian General Authority for Egypt, and the University of Karachi for Pakistan, with automatic daily updates.',
          q3:'How do I find my country?',
          a3:'Use the search box at the top of the countries page to search by country name in any language, or browse by geographic region: Arab Countries, Asia, Africa, Europe, the Americas, and Oceania.',
          q4:'Which calculation method is used?',
          a4:'The default method depends on the country: Umm al-Qura in Saudi Arabia, Egyptian in Egypt, Karachi in Pakistan, and Muslim World League for most other countries. You can change the calculation method from any city page via the Settings button.',
          q5:'Can I view prayer times for a specific city?',
          a5:'Yes, after selecting a country, all its major cities will be displayed with individual prayer times. You can also search directly for any city using the search bar at the top of the page.',
          q6:'Is the service free? Do I need to register?',
          a6:'Yes, all services on the site are 100% free and require no registration or subscription. You can use the site freely on any device, as many times as you like.' },
    fr: { title:'🌍 Heures de prière — Pays du monde',
          intro:'Sélectionnez votre pays ci-dessous pour afficher toutes ses villes avec les heures de prière précises.',
          back:'← Accueil',
          search:'Rechercher un pays...',
          noResults:'⚠️ Aucun résultat. Essayez une autre recherche.',
          metaDesc:"Heures de prière précises pour les pays du monde — sélectionnez votre pays pour voir toutes ses villes.",
          headerLabel:'Pays du monde',
          headerSub:'Heures de prière dans chaque pays',
          aboutTitle:'🌍 À propos des heures de prière dans le monde',
          aboutP1:"Notre site fournit les cinq heures de prière quotidiennes (Fajr, Dhuhr, Asr, Maghrib, Isha) pour plus de 190 pays dans le monde, avec une couverture complète de tous les pays arabes et islamiques ainsi que la plupart des pays d'Asie, d'Afrique, d'Europe, des Amériques et d'Océanie. Les heures sont calculées avec une grande précision à partir des coordonnées géographiques de chaque ville et sont mises à jour automatiquement chaque jour.",
          aboutP2:"Sélectionnez votre pays dans la liste ci-dessus pour afficher la liste complète de toutes ses villes, puis choisissez votre ville pour obtenir les heures de prière précises ainsi que la direction de la Qibla et la date Hijri. Vous pouvez également rechercher directement n'importe quelle ville dans le monde à partir de la barre de recherche en haut.",
          faqTitle:'❓ Questions fréquentes sur les heures de prière dans le monde',
          q1:'Combien de pays sont disponibles sur le site ?',
          a1:"Le site fournit les heures de prière pour plus de 190 pays dans le monde, couvrant tous les pays arabes et islamiques ainsi que la plupart des pays d'Asie, d'Afrique, d'Europe, des Amériques et d'Océanie.",
          q2:'Les heures de prière sont-elles précises pour chaque pays ?',
          a2:"Oui, nous utilisons des méthodes de calcul reconnues internationalement telles que Umm al-Qura pour l'Arabie saoudite, la Ligue musulmane mondiale pour la plupart des autres pays, l'Autorité générale égyptienne pour l'Égypte et l'Université de Karachi pour le Pakistan, avec des mises à jour quotidiennes automatiques.",
          q3:'Comment trouver mon pays ?',
          a3:"Utilisez la boîte de recherche en haut de la page des pays pour rechercher par nom de pays dans n'importe quelle langue, ou parcourez par région géographique : pays arabes, Asie, Afrique, Europe, Amériques et Océanie.",
          q4:'Quelle méthode de calcul est utilisée ?',
          a4:"La méthode par défaut dépend du pays : Umm al-Qura en Arabie saoudite, égyptienne en Égypte, Karachi au Pakistan et Ligue musulmane mondiale pour la plupart des autres pays. Vous pouvez modifier la méthode de calcul depuis la page de n'importe quelle ville via le bouton Paramètres.",
          q5:'Puis-je voir les heures de prière pour une ville spécifique ?',
          a5:"Oui, après avoir sélectionné un pays, toutes ses principales villes s'afficheront avec des heures de prière individuelles. Vous pouvez également rechercher directement n'importe quelle ville à l'aide de la barre de recherche en haut de la page.",
          q6:"Le service est-il gratuit ? Dois-je m'inscrire ?",
          a6:"Oui, tous les services du site sont 100% gratuits et ne nécessitent aucune inscription ou abonnement. Vous pouvez utiliser le site librement sur n'importe quel appareil, autant de fois que vous le souhaitez." },
    tr: { title:'🌍 Namaz Vakitleri — Dünya Ülkeleri',
          intro:'Tüm şehirlerini doğru namaz vakitleriyle görmek için aşağıdan ülkenizi seçin.',
          back:'← Ana Sayfa',
          search:'Ülke ara...',
          noResults:'⚠️ Eşleşen sonuç yok. Başka bir arama deneyin.',
          metaDesc:'Dünya ülkeleri için doğru namaz vakitleri — tüm şehirlerini görmek için ülkenizi seçin.',
          headerLabel:'Dünya Ülkeleri',
          headerSub:'Her ülkede namaz vakitleri',
          aboutTitle:'🌍 Dünya Ülkelerinde Namaz Vakitleri Hakkında',
          aboutP1:'Sitemiz, dünya genelinde 190\'dan fazla ülke için beş vakit namaz zamanlarını (İmsak, Öğle, İkindi, Akşam, Yatsı) sağlar. Tüm Arap ve İslam ülkeleri ile Asya, Afrika, Avrupa, Amerika ve Okyanusya\'daki çoğu ülke kapsamlı şekilde kapsanmaktadır. Vakitler, her şehrin coğrafi koordinatlarına göre yüksek doğrulukla hesaplanır ve her gün otomatik olarak güncellenir.',
          aboutP2:'Yukarıdaki listeden ülkenizi seçerek tüm şehirlerinin eksiksiz listesini görüntüleyin, ardından doğru namaz vakitleri ile Kıble yönü ve Hicri tarihi almak için şehrinizi seçin. Üstteki arama çubuğundan dünyadaki herhangi bir şehri doğrudan arayabilirsiniz.',
          faqTitle:'❓ Dünyada Namaz Vakitleri Hakkında Sıkça Sorulan Sorular',
          q1:'Sitede kaç ülke mevcut?',
          a1:'Site, tüm Arap ve İslam ülkeleri ile Asya, Afrika, Avrupa, Amerika ve Okyanusya\'daki çoğu ülkeyi kapsayan 190\'dan fazla ülke için namaz vakitleri sağlar.',
          q2:'Namaz vakitleri her ülke için doğru mu?',
          a2:'Evet, Suudi Arabistan için Ümmü\'l-Kura, diğer ülkelerin çoğu için İslam Dünyası Birliği, Mısır için Mısır Genel Kurumu ve Pakistan için Karachi Üniversitesi gibi uluslararası kabul görmüş hesaplama yöntemlerini kullanıyor ve otomatik günlük güncelleme yapıyoruz.',
          q3:'Ülkemi nasıl bulabilirim?',
          a3:'Ülke sayfasının üstündeki arama kutusunu kullanarak herhangi bir dilde ülke adıyla arama yapın veya coğrafi bölgeye göre göz atın: Arap Ülkeleri, Asya, Afrika, Avrupa, Amerika ve Okyanusya.',
          q4:'Hangi hesaplama yöntemi kullanılıyor?',
          a4:'Varsayılan yöntem ülkeye göre değişir: Suudi Arabistan\'da Ümmü\'l-Kura, Mısır\'da Mısır, Pakistan\'da Karachi ve diğer ülkelerin çoğunda İslam Dünyası Birliği. Herhangi bir şehir sayfasından Ayarlar düğmesi aracılığıyla hesaplama yöntemini değiştirebilirsiniz.',
          q5:'Belirli bir şehir için namaz vakitlerini görebilir miyim?',
          a5:'Evet, bir ülke seçtikten sonra tüm büyük şehirleri ayrı ayrı namaz vakitleriyle görüntülenecektir. Sayfanın üstündeki arama çubuğunu kullanarak herhangi bir şehri doğrudan da arayabilirsiniz.',
          q6:'Hizmet ücretsiz mi? Kayıt olmam gerekiyor mu?',
          a6:'Evet, sitedeki tüm hizmetler %100 ücretsizdir ve kayıt veya abonelik gerektirmez. Siteyi herhangi bir cihazda istediğiniz kadar özgürce kullanabilirsiniz.' },
    ur: { title:'🌍 اوقاتِ نماز — دنیا کے ممالک',
          intro:'اپنے ملک کا انتخاب کریں تاکہ اس کے تمام شہروں کے درست اوقاتِ نماز دیکھ سکیں۔',
          back:'← ہوم',
          search:'ملک تلاش کریں...',
          noResults:'⚠️ کوئی نتیجہ نہیں ملا۔ کوئی اور تلاش آزمائیں۔',
          metaDesc:'دنیا کے تمام ممالک کے درست اوقاتِ نماز — اپنے ملک کا انتخاب کریں۔',
          headerLabel:'دنیا کے ممالک',
          headerSub:'ہر ملک میں اوقاتِ نماز',
          aboutTitle:'🌍 دنیا کے ممالک میں اوقاتِ نماز کے بارے میں',
          aboutP1:'ہماری سائٹ دنیا کے 190 سے زائد ممالک کے لیے پانچ روزانہ نماز کے اوقات (فجر، ظہر، عصر، مغرب، عشاء) فراہم کرتی ہے، جس میں تمام عرب اور اسلامی ممالک کے ساتھ ساتھ ایشیا، افریقہ، یورپ، امریکہ اور اوشیانا کے زیادہ تر ممالک کی جامع کوریج ہے۔ اوقات ہر شہر کے جغرافیائی نقاط کی بنیاد پر اعلیٰ درستگی کے ساتھ حساب کیے جاتے ہیں اور ہر روز خودکار طور پر اپ ڈیٹ ہوتے ہیں۔',
          aboutP2:'اوپر دی گئی فہرست سے اپنا ملک منتخب کریں تاکہ اس کے تمام شہروں کی مکمل فہرست دیکھ سکیں، پھر اپنا شہر منتخب کریں تاکہ درست اوقاتِ نماز کے ساتھ قبلے کی سمت اور ہجری تاریخ حاصل کر سکیں۔ آپ اوپر کے سرچ بار سے دنیا کے کسی بھی شہر کو براہِ راست تلاش بھی کر سکتے ہیں۔',
          faqTitle:'❓ دنیا میں اوقاتِ نماز کے بارے میں اکثر پوچھے جانے والے سوالات',
          q1:'سائٹ پر کتنے ممالک دستیاب ہیں؟',
          a1:'سائٹ پر 190 سے زائد ممالک کے اوقاتِ نماز موجود ہیں، جن میں تمام عرب اور اسلامی ممالک اور ایشیا، افریقہ، یورپ، امریکہ اور اوشیانا کے زیادہ تر ممالک شامل ہیں۔',
          q2:'کیا ہر ملک کے لیے اوقاتِ نماز درست ہیں؟',
          a2:'جی ہاں، ہم بین الاقوامی طور پر تسلیم شدہ حساب کے طریقے استعمال کرتے ہیں جیسے سعودی عرب کے لیے ام القریٰ، زیادہ تر دیگر ممالک کے لیے رابطہ عالمِ اسلامی، مصر کے لیے مصری عام اتھارٹی، اور پاکستان کے لیے کراچی یونیورسٹی، خودکار روزانہ اپ ڈیٹ کے ساتھ۔',
          q3:'میں اپنا ملک کیسے تلاش کروں؟',
          a3:'ممالک کے صفحے کے اوپر سرچ باکس استعمال کر کے کسی بھی زبان میں ملک کے نام سے تلاش کریں، یا جغرافیائی خطے کے لحاظ سے براؤز کریں: عرب ممالک، ایشیا، افریقہ، یورپ، امریکہ اور اوشیانا۔',
          q4:'کون سا حساب کرنے کا طریقہ استعمال ہوتا ہے؟',
          a4:'پہلے سے طے شدہ طریقہ ملک کے لحاظ سے مختلف ہوتا ہے: سعودی عرب میں ام القریٰ، مصر میں مصری، پاکستان میں کراچی، اور زیادہ تر دیگر ممالک کے لیے رابطہ عالمِ اسلامی۔ آپ کسی بھی شہر کے صفحے سے سیٹنگز بٹن کے ذریعے حساب کا طریقہ تبدیل کر سکتے ہیں۔',
          q5:'کیا میں کسی مخصوص شہر کے اوقاتِ نماز دیکھ سکتا ہوں؟',
          a5:'جی ہاں، ملک منتخب کرنے کے بعد اس کے تمام بڑے شہر انفرادی اوقاتِ نماز کے ساتھ دکھائے جائیں گے۔ آپ صفحے کے اوپر سرچ بار کا استعمال کرتے ہوئے کسی بھی شہر کو براہِ راست تلاش بھی کر سکتے ہیں۔',
          q6:'کیا یہ خدمت مفت ہے؟ کیا مجھے رجسٹریشن کرنی ہوگی؟',
          a6:'جی ہاں، سائٹ پر تمام خدمات 100% مفت ہیں اور کسی رجسٹریشن یا سبسکرپشن کی ضرورت نہیں ہے۔ آپ کسی بھی ڈیوائس پر جتنی بار چاہیں سائٹ کو آزادانہ استعمال کر سکتے ہیں۔' },
    de: { title:'🌍 Gebetszeiten — Länder weltweit',
          intro:'Wählen Sie unten Ihr Land aus, um alle Städte mit genauen Gebetszeiten anzuzeigen.',
          back:'← Startseite',
          search:'Land suchen...',
          noResults:'⚠️ Keine passenden Ergebnisse. Versuchen Sie eine andere Suche.',
          metaDesc:'Genaue Gebetszeiten für alle Länder weltweit — wählen Sie Ihr Land, um alle Städte zu sehen.',
          headerLabel:'Länder weltweit',
          headerSub:'Gebetszeiten in jedem Land',
          aboutTitle:'🌍 Über Gebetszeiten in Ländern weltweit',
          aboutP1:'Unsere Website bietet die fünf täglichen Gebetszeiten (Fadschr, Zuhr, Asr, Maghrib, Ischa) für mehr als 190 Länder weltweit, mit umfassender Abdeckung aller arabischen und islamischen Länder sowie der meisten Länder in Asien, Afrika, Europa, Nord- und Südamerika und Ozeanien. Die Zeiten werden mit hoher Präzision anhand der geografischen Koordinaten jeder Stadt berechnet und täglich automatisch aktualisiert.',
          aboutP2:'Wählen Sie Ihr Land aus der obigen Liste, um eine vollständige Liste aller Städte anzuzeigen, und wählen Sie dann Ihre Stadt, um genaue Gebetszeiten zusammen mit der Qibla-Richtung und dem Hidschri-Datum zu erhalten. Sie können auch direkt nach jeder Stadt der Welt über die Suchleiste oben suchen.',
          faqTitle:'❓ Häufig gestellte Fragen zu Gebetszeiten weltweit',
          q1:'Wie viele Länder sind auf der Website verfügbar?',
          a1:'Die Website bietet Gebetszeiten für mehr als 190 Länder weltweit und deckt alle arabischen und islamischen Länder sowie die meisten Länder in Asien, Afrika, Europa, Nord- und Südamerika und Ozeanien ab.',
          q2:'Sind die Gebetszeiten für jedes Land genau?',
          a2:'Ja, wir verwenden international anerkannte Berechnungsmethoden wie Umm al-Qura für Saudi-Arabien, die Muslimische Weltliga für die meisten anderen Länder, die Ägyptische Generalbehörde für Ägypten und die Universität Karatschi für Pakistan, mit automatischen täglichen Aktualisierungen.',
          q3:'Wie finde ich mein Land?',
          a3:'Verwenden Sie das Suchfeld oben auf der Länderseite, um nach dem Ländernamen in jeder Sprache zu suchen, oder durchsuchen Sie nach geografischer Region: arabische Länder, Asien, Afrika, Europa, Nord- und Südamerika und Ozeanien.',
          q4:'Welche Berechnungsmethode wird verwendet?',
          a4:'Die Standardmethode hängt vom Land ab: Umm al-Qura in Saudi-Arabien, Ägyptisch in Ägypten, Karatschi in Pakistan und Muslimische Weltliga für die meisten anderen Länder. Sie können die Berechnungsmethode über die Schaltfläche Einstellungen auf jeder Stadtseite ändern.',
          q5:'Kann ich Gebetszeiten für eine bestimmte Stadt anzeigen?',
          a5:'Ja, nach Auswahl eines Landes werden alle großen Städte mit individuellen Gebetszeiten angezeigt. Sie können auch direkt nach einer Stadt über die Suchleiste oben auf der Seite suchen.',
          q6:'Ist der Dienst kostenlos? Muss ich mich registrieren?',
          a6:'Ja, alle Dienste auf der Website sind 100% kostenlos und erfordern keine Registrierung oder Abonnement. Sie können die Website auf jedem Gerät so oft Sie möchten frei nutzen.' },
    id: { title:'🌍 Jadwal Sholat — Negara-Negara di Dunia',
          intro:'Pilih negara Anda di bawah untuk melihat semua kotanya dengan jadwal sholat yang akurat.',
          back:'← Beranda',
          search:'Cari negara...',
          noResults:'⚠️ Tidak ada hasil yang cocok. Coba pencarian lain.',
          metaDesc:'Jadwal sholat akurat untuk semua negara di dunia — pilih negara Anda untuk melihat semua kotanya.',
          headerLabel:'Negara-Negara di Dunia',
          headerSub:'Jadwal sholat di setiap negara',
          aboutTitle:'🌍 Tentang Jadwal Sholat di Negara-Negara Dunia',
          aboutP1:'Situs kami menyediakan lima waktu sholat harian (Subuh, Zuhur, Asar, Magrib, Isya) untuk lebih dari 190 negara di seluruh dunia, dengan cakupan komprehensif semua negara Arab dan Islam serta sebagian besar negara di Asia, Afrika, Eropa, Benua Amerika, dan Oseania. Waktu dihitung dengan presisi tinggi berdasarkan koordinat geografis setiap kota dan diperbarui otomatis setiap hari.',
          aboutP2:'Pilih negara Anda dari daftar di atas untuk melihat daftar lengkap semua kotanya, lalu pilih kota Anda untuk mendapatkan jadwal sholat yang akurat beserta arah Kiblat dan tanggal Hijriyah. Anda juga dapat mencari langsung kota mana pun di dunia dari bilah pencarian di atas.',
          faqTitle:'❓ Pertanyaan yang Sering Diajukan Tentang Jadwal Sholat di Dunia',
          q1:'Berapa banyak negara yang tersedia di situs ini?',
          a1:'Situs ini menyediakan jadwal sholat untuk lebih dari 190 negara di seluruh dunia, mencakup semua negara Arab dan Islam serta sebagian besar negara di Asia, Afrika, Eropa, Benua Amerika, dan Oseania.',
          q2:'Apakah jadwal sholat akurat untuk setiap negara?',
          a2:'Ya, kami menggunakan metode perhitungan yang diakui secara internasional seperti Umm al-Qura untuk Arab Saudi, Liga Dunia Muslim untuk sebagian besar negara lain, Otoritas Umum Mesir untuk Mesir, dan Universitas Karachi untuk Pakistan, dengan pembaruan harian otomatis.',
          q3:'Bagaimana cara menemukan negara saya?',
          a3:'Gunakan kotak pencarian di bagian atas halaman negara untuk mencari berdasarkan nama negara dalam bahasa apa pun, atau jelajahi berdasarkan wilayah geografis: Negara Arab, Asia, Afrika, Eropa, Benua Amerika, dan Oseania.',
          q4:'Metode perhitungan apa yang digunakan?',
          a4:'Metode default bergantung pada negara: Umm al-Qura di Arab Saudi, Mesir di Mesir, Karachi di Pakistan, dan Liga Dunia Muslim untuk sebagian besar negara lain. Anda dapat mengubah metode perhitungan dari halaman kota mana pun melalui tombol Pengaturan.',
          q5:'Bisakah saya melihat jadwal sholat untuk kota tertentu?',
          a5:'Ya, setelah memilih negara, semua kota besarnya akan ditampilkan dengan jadwal sholat individual. Anda juga dapat mencari langsung kota mana pun menggunakan bilah pencarian di bagian atas halaman.',
          q6:'Apakah layanan ini gratis? Apakah saya perlu mendaftar?',
          a6:'Ya, semua layanan di situs 100% gratis dan tidak memerlukan pendaftaran atau langganan. Anda dapat menggunakan situs dengan bebas di perangkat apa pun, sebanyak yang Anda inginkan.' },
    es: { title:'🌍 Horarios de Oración — Países del Mundo',
          intro:'Selecciona tu país abajo para ver todas sus ciudades con horarios de oración precisos.',
          back:'← Inicio',
          search:'Buscar un país...',
          noResults:'⚠️ No hay resultados coincidentes. Prueba otra búsqueda.',
          metaDesc:'Horarios de oración precisos para todos los países del mundo — elige tu país para ver todas sus ciudades.',
          headerLabel:'Países del mundo',
          headerSub:'Horarios de oración en cada país',
          aboutTitle:'🌍 Sobre los Horarios de Oración en Países del Mundo',
          aboutP1:'Nuestro sitio proporciona los cinco horarios diarios de oración (Fayr, Dhuhr, Asr, Magrib, Isha) para más de 190 países en todo el mundo, con cobertura completa de todos los países árabes e islámicos y la mayoría de los países de Asia, África, Europa, las Américas y Oceanía. Los horarios se calculan con alta precisión basándose en las coordenadas geográficas de cada ciudad y se actualizan automáticamente cada día.',
          aboutP2:'Selecciona tu país en la lista de arriba para ver una lista completa de todas sus ciudades, luego elige tu ciudad para obtener horarios de oración precisos junto con la dirección de la Qibla y la fecha Hijri. También puedes buscar directamente cualquier ciudad del mundo desde la barra de búsqueda superior.',
          faqTitle:'❓ Preguntas Frecuentes sobre los Horarios de Oración en el Mundo',
          q1:'¿Cuántos países están disponibles en el sitio?',
          a1:'El sitio proporciona horarios de oración para más de 190 países en todo el mundo, cubriendo todos los países árabes e islámicos y la mayoría de los países de Asia, África, Europa, las Américas y Oceanía.',
          q2:'¿Los horarios de oración son precisos para cada país?',
          a2:'Sí, usamos métodos de cálculo reconocidos internacionalmente como Umm al-Qura para Arabia Saudita, la Liga Musulmana Mundial para la mayoría de otros países, la Autoridad General Egipcia para Egipto y la Universidad de Karachi para Pakistán, con actualizaciones diarias automáticas.',
          q3:'¿Cómo encuentro mi país?',
          a3:'Usa el cuadro de búsqueda en la parte superior de la página de países para buscar por nombre de país en cualquier idioma, o navega por región geográfica: Países Árabes, Asia, África, Europa, las Américas y Oceanía.',
          q4:'¿Qué método de cálculo se utiliza?',
          a4:'El método predeterminado depende del país: Umm al-Qura en Arabia Saudita, Egipcio en Egipto, Karachi en Pakistán y Liga Musulmana Mundial para la mayoría de otros países. Puedes cambiar el método de cálculo desde cualquier página de ciudad mediante el botón Ajustes.',
          q5:'¿Puedo ver los horarios de oración para una ciudad específica?',
          a5:'Sí, después de seleccionar un país, se mostrarán todas sus principales ciudades con horarios de oración individuales. También puedes buscar directamente cualquier ciudad usando la barra de búsqueda en la parte superior de la página.',
          q6:'¿El servicio es gratuito? ¿Necesito registrarme?',
          a6:'Sí, todos los servicios del sitio son 100% gratuitos y no requieren registro ni suscripción. Puedes usar el sitio libremente en cualquier dispositivo, tantas veces como quieras.' },
    bn: { title:'🌍 নামাজের সময় — বিশ্বের দেশসমূহ',
          intro:'নির্ভুল নামাজের সময়সূচীসহ সব শহর দেখতে নিচে আপনার দেশ নির্বাচন করুন।',
          back:'← হোম',
          search:'একটি দেশ খুঁজুন...',
          noResults:'⚠️ কোন মিলে যাওয়া ফলাফল নেই। অন্য অনুসন্ধান চেষ্টা করুন।',
          metaDesc:'বিশ্বের সব দেশের জন্য নির্ভুল নামাজের সময় — সব শহর দেখতে আপনার দেশ নির্বাচন করুন।',
          headerLabel:'বিশ্বের দেশসমূহ',
          headerSub:'প্রতিটি দেশে নামাজের সময়',
          aboutTitle:'🌍 বিশ্বের দেশসমূহে নামাজের সময় সম্পর্কে',
          aboutP1:'আমাদের সাইট বিশ্বব্যাপী ১৯০টিরও বেশি দেশের জন্য পাঁচ ওয়াক্ত নামাজের সময় (ফজর, জোহর, আসর, মাগরিব, এশা) প্রদান করে। সমস্ত আরব ও ইসলামিক দেশ এবং এশিয়া, আফ্রিকা, ইউরোপ, আমেরিকা ও ওশেনিয়ার বেশিরভাগ দেশ ব্যাপকভাবে অন্তর্ভুক্ত। প্রতিটি শহরের ভৌগোলিক স্থানাঙ্কের ভিত্তিতে উচ্চ নির্ভুলতায় সময় গণনা করা হয় এবং প্রতিদিন স্বয়ংক্রিয়ভাবে আপডেট হয়।',
          aboutP2:'উপরের তালিকা থেকে আপনার দেশ নির্বাচন করে সব শহরের সম্পূর্ণ তালিকা দেখুন, তারপর কিবলার দিক ও হিজরি তারিখসহ নির্ভুল নামাজের সময় পেতে আপনার শহর বেছে নিন। আপনি শীর্ষ অনুসন্ধান বার থেকে বিশ্বের যেকোনো শহর সরাসরিও খুঁজতে পারেন।',
          faqTitle:'❓ বিশ্বে নামাজের সময় সম্পর্কে প্রায়শই জিজ্ঞাসিত প্রশ্ন',
          q1:'সাইটে কয়টি দেশ উপলব্ধ?',
          a1:'সাইট বিশ্বের ১৯০টিরও বেশি দেশের জন্য নামাজের সময় প্রদান করে, যা সমস্ত আরব ও ইসলামিক দেশ এবং এশিয়া, আফ্রিকা, ইউরোপ, আমেরিকা ও ওশেনিয়ার বেশিরভাগ দেশকে আচ্ছাদিত করে।',
          q2:'প্রতিটি দেশের জন্য কি নামাজের সময় নির্ভুল?',
          a2:'হ্যাঁ, আমরা আন্তর্জাতিকভাবে স্বীকৃত গণনা পদ্ধতি ব্যবহার করি যেমন সৌদি আরবের জন্য উম্মুল কুরা, বেশিরভাগ অন্যান্য দেশের জন্য মুসলিম বিশ্ব লীগ, মিশরের জন্য মিশরীয় সাধারণ কর্তৃপক্ষ এবং পাকিস্তানের জন্য করাচি বিশ্ববিদ্যালয়, স্বয়ংক্রিয় দৈনিক আপডেটসহ।',
          q3:'আমি কীভাবে আমার দেশ খুঁজব?',
          a3:'যেকোনো ভাষায় দেশের নাম দিয়ে অনুসন্ধান করতে দেশ পৃষ্ঠার শীর্ষে অনুসন্ধান বাক্স ব্যবহার করুন, বা ভৌগোলিক অঞ্চল অনুসারে ব্রাউজ করুন: আরব দেশ, এশিয়া, আফ্রিকা, ইউরোপ, আমেরিকা এবং ওশেনিয়া।',
          q4:'কোন গণনা পদ্ধতি ব্যবহার করা হয়?',
          a4:'ডিফল্ট পদ্ধতি দেশের উপর নির্ভর করে: সৌদি আরবে উম্মুল কুরা, মিশরে মিশরীয়, পাকিস্তানে করাচি এবং বেশিরভাগ অন্যান্য দেশের জন্য মুসলিম বিশ্ব লীগ। আপনি যেকোনো শহর পৃষ্ঠা থেকে সেটিংস বোতামের মাধ্যমে গণনা পদ্ধতি পরিবর্তন করতে পারেন।',
          q5:'আমি কি একটি নির্দিষ্ট শহরের নামাজের সময় দেখতে পারি?',
          a5:'হ্যাঁ, একটি দেশ নির্বাচন করার পরে, এর সমস্ত প্রধান শহর পৃথক নামাজের সময়সহ প্রদর্শিত হবে। আপনি পৃষ্ঠার শীর্ষে অনুসন্ধান বার ব্যবহার করে যেকোনো শহর সরাসরিও খুঁজতে পারেন।',
          q6:'সেবা কি বিনামূল্যে? আমার কি নিবন্ধন প্রয়োজন?',
          a6:'হ্যাঁ, সাইটের সমস্ত সেবা ১০০% বিনামূল্যে এবং কোন নিবন্ধন বা সাবস্ক্রিপশন প্রয়োজন হয় না। আপনি যেকোনো ডিভাইসে আপনার যতবার ইচ্ছা সাইটটি স্বাধীনভাবে ব্যবহার করতে পারেন।' },
    ms: { title:'🌍 Waktu Solat — Negara-Negara di Dunia',
          intro:'Pilih negara anda di bawah untuk melihat semua bandarnya dengan waktu solat yang tepat.',
          back:'← Utama',
          search:'Cari negara...',
          noResults:'⚠️ Tiada hasil yang sepadan. Cuba carian lain.',
          metaDesc:'Waktu solat yang tepat untuk semua negara di dunia — pilih negara anda untuk melihat semua bandarnya.',
          headerLabel:'Negara-Negara di Dunia',
          headerSub:'Waktu solat di setiap negara',
          aboutTitle:'🌍 Tentang Waktu Solat di Negara-Negara Dunia',
          aboutP1:'Laman kami menyediakan lima waktu solat harian (Subuh, Zohor, Asar, Maghrib, Isyak) untuk lebih daripada 190 negara di seluruh dunia, dengan liputan komprehensif semua negara Arab dan Islam serta kebanyakan negara di Asia, Afrika, Eropah, Amerika dan Oceania. Waktu dikira dengan ketepatan tinggi berdasarkan koordinat geografi setiap bandar dan dikemas kini secara automatik setiap hari.',
          aboutP2:'Pilih negara anda daripada senarai di atas untuk melihat senarai lengkap semua bandarnya, kemudian pilih bandar anda untuk mendapatkan waktu solat yang tepat bersama arah Kiblat dan tarikh Hijrah. Anda juga boleh mencari terus mana-mana bandar di dunia dari bar carian di atas.',
          faqTitle:'❓ Soalan Lazim tentang Waktu Solat di Dunia',
          q1:'Berapa banyak negara tersedia di laman ini?',
          a1:'Laman ini menyediakan waktu solat untuk lebih daripada 190 negara di seluruh dunia, meliputi semua negara Arab dan Islam serta kebanyakan negara di Asia, Afrika, Eropah, Amerika dan Oceania.',
          q2:'Adakah waktu solat tepat untuk setiap negara?',
          a2:'Ya, kami menggunakan kaedah pengiraan yang diiktiraf antarabangsa seperti Umm al-Qura untuk Arab Saudi, Liga Dunia Muslim untuk kebanyakan negara lain, Pihak Berkuasa Am Mesir untuk Mesir, dan Universiti Karachi untuk Pakistan, dengan kemas kini harian automatik.',
          q3:'Bagaimana saya mencari negara saya?',
          a3:'Gunakan kotak carian di bahagian atas halaman negara untuk mencari mengikut nama negara dalam mana-mana bahasa, atau lungsur mengikut kawasan geografi: Negara Arab, Asia, Afrika, Eropah, Amerika dan Oceania.',
          q4:'Apakah kaedah pengiraan yang digunakan?',
          a4:'Kaedah lalai bergantung pada negara: Umm al-Qura di Arab Saudi, Mesir di Mesir, Karachi di Pakistan dan Liga Dunia Muslim untuk kebanyakan negara lain. Anda boleh menukar kaedah pengiraan dari mana-mana halaman bandar melalui butang Tetapan.',
          q5:'Bolehkah saya melihat waktu solat untuk bandar tertentu?',
          a5:'Ya, selepas memilih negara, semua bandar besarnya akan dipaparkan dengan waktu solat individu. Anda juga boleh mencari terus mana-mana bandar menggunakan bar carian di bahagian atas halaman.',
          q6:'Adakah perkhidmatan ini percuma? Perlukah saya mendaftar?',
          a6:'Ya, semua perkhidmatan di laman ini adalah 100% percuma dan tidak memerlukan pendaftaran atau langganan. Anda boleh menggunakan laman ini secara bebas pada mana-mana peranti, seberapa banyak yang anda mahu.' },
};

// اسم دولة حسب اللغة (fallback إلى English إن لم توجد ترجمة)
function _countryNameForLang(cc, lang) {
    if (lang === 'ar') return COUNTRY_NAMES_AR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'fr') return _COUNTRY_NAMES_FR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'tr') return _COUNTRY_NAMES_TR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'ur') return _COUNTRY_NAMES_UR[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'de') return _COUNTRY_NAMES_DE[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'id') return _COUNTRY_NAMES_ID[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'es') return _COUNTRY_NAMES_ES[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'bn') return _COUNTRY_NAMES_BN[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    if (lang === 'ms') return _COUNTRY_NAMES_MS[cc] || COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
    return COUNTRY_NAMES_EN[cc] || cc.toUpperCase();
}

function _buildCountriesGrid(lang) {
    const urlPrefix = (lang === 'ar') ? '' : '/' + lang;
    let out = '';
    for (const region of Object.keys(_COUNTRIES_REGIONS)) {
        const codes = _COUNTRIES_REGIONS[region];
        const regionTitle = (_REGION_TITLES[region] && _REGION_TITLES[region][lang]) || _REGION_TITLES[region].en;
        out += `\n<section class="region-block" data-region="${region}">`;
        out += `\n    <h2>${_escHtml(regionTitle)}</h2>`;
        out += `\n    <nav class="arab-countries-grid" aria-label="${_escHtml(regionTitle)}">`;
        for (const cc of codes) {
            const name = _countryNameForLang(cc, lang);
            const slug = makeCountrySlugSrv(cc);
            const enName = COUNTRY_NAMES_EN[cc] || '';
            const href = `${urlPrefix}/prayer-times-in-${slug}`;
            out += `\n        <a href="${href}" class="country-tile" data-cc="${cc}" data-en="${_escHtml(enName.toLowerCase())}"><img src="https://flagcdn.com/w40/${cc}.png" alt="${_escHtml(name)}" width="40" height="30" loading="lazy"><span>${_escHtml(name)}</span></a>`;
        }
        out += '\n    </nav>\n</section>';
    }
    return out;
}

// يُقدَّم countries.html مع حقن الـ grid + العناوين حسب اللغة
function serveCountriesPage(urlPath, res, acceptEnc) {
    readCachedFile(path.join(ROOT, 'countries.html'), (err, htmlBuf) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        // استنتاج اللغة من الـ URL
        const langMatch = urlPath.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)\/prayer-times-worldwide$/);
        const lang = langMatch ? langMatch[1] : 'ar';
        const t = _COUNTRIES_PAGE_TEXTS[lang] || _COUNTRIES_PAGE_TEXTS.ar;
        const dir = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';

        let html = htmlBuf.toString('utf8');

        // <html lang + dir>
        html = html.replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${lang}" dir="${dir}">`);

        // <title>
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${_escHtml(t.title)}</title>`);

        // meta description
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${_escHtml(t.metaDesc)}">`);

        // H1
        html = html.replace(/<h1 id="countries-page-title">[^<]*<\/h1>/, `<h1 id="countries-page-title">${_escHtml(t.title)}</h1>`);

        // Top-header label + sub
        html = html.replace(/<div class="city-name" id="countries-header-title"[^>]*>[^<]*<\/div>/,
            `<div class="city-name" id="countries-header-title" data-i18n="countries.header_label">${_escHtml(t.headerLabel)}</div>`);
        html = html.replace(/<div class="country" data-i18n="countries\.header_sub">[^<]*<\/div>/,
            `<div class="country" data-i18n="countries.header_sub">${_escHtml(t.headerSub)}</div>`);

        // intro paragraph
        html = html.replace(/<p class="countries-intro" id="countries-intro"[^>]*>[\s\S]*?<\/p>/,
            `<p class="countries-intro" id="countries-intro" data-i18n="countries.intro">${_escHtml(t.intro)}</p>`);

        // back link (href يحترم الـ locale)
        const backHref = (lang === 'ar') ? '/' : `/${lang}/`;
        html = html.replace(/<a href="\/" class="countries-back-link"[^>]*>[^<]*<\/a>/,
            `<a href="${backHref}" class="countries-back-link" id="countries-back-link" data-i18n="countries.back">${_escHtml(t.back)}</a>`);

        // search input (placeholder + aria-label)
        html = html.replace(/placeholder="[^"]*"\s*data-i18n-placeholder="countries\.search_placeholder"/,
            `placeholder="${_escHtml(t.search)}" data-i18n-placeholder="countries.search_placeholder"`);
        html = html.replace(/aria-label="ابحث عن دولة"/, `aria-label="${_escHtml(t.search)}"`);

        // empty state
        html = html.replace(/<div id="countries-empty" class="countries-empty-state"[^>]*>[\s\S]*?<\/div>/,
            `<div id="countries-empty" class="countries-empty-state" data-i18n="countries.no_results">${_escHtml(t.noResults)}</div>`);

        // About section (SEO)
        html = html.replace(/<h2 id="countries-about-title">[\s\S]*?<\/h2>/,
            `<h2 id="countries-about-title">${_escHtml(t.aboutTitle)}</h2>`);
        html = html.replace(/<p id="countries-about-p1">[\s\S]*?<\/p>/,
            `<p id="countries-about-p1">${_escHtml(t.aboutP1)}</p>`);
        html = html.replace(/<p id="countries-about-p2">[\s\S]*?<\/p>/,
            `<p id="countries-about-p2">${_escHtml(t.aboutP2)}</p>`);

        // FAQ section (SEO)
        html = html.replace(/<h2 id="countries-faq-title">[\s\S]*?<\/h2>/,
            `<h2 id="countries-faq-title">${_escHtml(t.faqTitle)}</h2>`);
        for (let i = 1; i <= 6; i++) {
            const q = t['q' + i] || '';
            const a = t['a' + i] || '';
            html = html.replace(
                new RegExp(`<div class="faq-question" id="cfaq-q${i}">[\\s\\S]*?<\\/div>`),
                `<div class="faq-question" id="cfaq-q${i}">${_escHtml(q)}</div>`
            );
            html = html.replace(
                new RegExp(`<p id="cfaq-a${i}">[\\s\\S]*?<\\/p>`),
                `<p id="cfaq-a${i}">${_escHtml(a)}</p>`
            );
        }

        // FAQPage Schema.org JSON-LD (SEO)
        const _faqEntities = [];
        for (let i = 1; i <= 6; i++) {
            _faqEntities.push({
                '@type': 'Question',
                'name': t['q' + i] || '',
                'acceptedAnswer': { '@type': 'Answer', 'text': t['a' + i] || '' }
            });
        }
        const _faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'inLanguage': lang,
            'mainEntity': _faqEntities
        };
        const _faqJson = JSON.stringify(_faqSchema).replace(/</g, '\\u003c');
        html = html.replace(/<!-- COUNTRIES-FAQ-SCHEMA -->/,
            `<script type="application/ld+json">${_faqJson}</script>`);

        // {LANG_PREFIX} للروابط الداخلية في قسمَي home-quick-access و home-footer-links
        const _langPrefix = (lang === 'ar') ? '' : '/' + lang;
        html = html.split('{LANG_PREFIX}').join(_langPrefix);

        // ====== SSR i18n لأقسام home-footer-links + popular-cities ======
        const _cFooterI18n = {
            ar: { pop:'🕌 مواقيت الصلاة في أبرز المدن', srv:'🧭 خدمات إسلامية أخرى', share:'🔗 شارك الموقع',
                  l_hijri_today:'التاريخ الهجري اليوم', l_hijri_year:'التقويم الهجري 1447',
                  l_date_conv:'تحويل التاريخ', l_tasbih:'المسبحة الإلكترونية',
                  x:'تويتر/X', fb:'فيسبوك', wa:'واتساب', tg:'تلغرام', popAria:'المدن الشائعة', svcAria:'الخدمات الإسلامية' },
            en: { pop:'🕌 Prayer Times in Major Cities', srv:'🧭 Other Islamic Services', share:'🔗 Share This Site',
                  l_hijri_today:"Today's Hijri Date", l_hijri_year:'Hijri Calendar 1447',
                  l_date_conv:'Date Converter', l_tasbih:'Digital Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Popular cities', svcAria:'Islamic services' },
            fr: { pop:'🕌 Heures de prière dans les grandes villes', srv:'🧭 Autres services islamiques', share:'🔗 Partager ce site',
                  l_hijri_today:"Date Hijri d'aujourd'hui", l_hijri_year:'Calendrier Hijri 1447',
                  l_date_conv:'Convertisseur de date', l_tasbih:'Tasbih numérique',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Villes populaires', svcAria:'Services islamiques' },
            tr: { pop:'🕌 Büyük Şehirlerde Namaz Vakitleri', srv:'🧭 Diğer İslami Hizmetler', share:'🔗 Bu siteyi paylaş',
                  l_hijri_today:'Bugünün Hicri Tarihi', l_hijri_year:'Hicri Takvim 1447',
                  l_date_conv:'Tarih Dönüştürücü', l_tasbih:'Dijital Tesbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Popüler şehirler', svcAria:'İslami hizmetler' },
            ur: { pop:'🕌 بڑے شہروں میں اوقاتِ نماز', srv:'🧭 دیگر اسلامی خدمات', share:'🔗 سائٹ شیئر کریں',
                  l_hijri_today:'آج کی ہجری تاریخ', l_hijri_year:'ہجری کیلنڈر 1447',
                  l_date_conv:'تاریخ کنورٹر', l_tasbih:'ڈیجیٹل تسبیح',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'مشہور شہر', svcAria:'اسلامی خدمات' },
            de: { pop:'🕌 Gebetszeiten in großen Städten', srv:'🧭 Weitere islamische Dienste', share:'🔗 Diese Seite teilen',
                  l_hijri_today:'Heutiges Hidschri-Datum', l_hijri_year:'Hidschri-Kalender 1447',
                  l_date_conv:'Datumsumrechner', l_tasbih:'Digitale Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Beliebte Städte', svcAria:'Islamische Dienste' },
            id: { pop:'🕌 Jadwal Sholat di Kota-Kota Besar', srv:'🧭 Layanan Islami Lainnya', share:'🔗 Bagikan situs ini',
                  l_hijri_today:'Tanggal Hijriyah Hari Ini', l_hijri_year:'Kalender Hijriyah 1447',
                  l_date_conv:'Konverter Tanggal', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Kota-kota populer', svcAria:'Layanan Islami' },
            es: { pop:'🕌 Horarios de Oración en Ciudades Principales', srv:'🧭 Otros Servicios Islámicos', share:'🔗 Compartir este sitio',
                  l_hijri_today:'Fecha Hijri de Hoy', l_hijri_year:'Calendario Hijri 1447',
                  l_date_conv:'Conversor de Fechas', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Ciudades populares', svcAria:'Servicios islámicos' },
            bn: { pop:'🕌 প্রধান শহরগুলোতে নামাজের সময়', srv:'🧭 অন্যান্য ইসলামিক সেবা', share:'🔗 এই সাইট শেয়ার করুন',
                  l_hijri_today:'আজকের হিজরি তারিখ', l_hijri_year:'হিজরি ক্যালেন্ডার 1447',
                  l_date_conv:'তারিখ রূপান্তরকারী', l_tasbih:'ডিজিটাল তাসবিহ',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'জনপ্রিয় শহর', svcAria:'ইসলামিক সেবা' },
            ms: { pop:'🕌 Waktu Solat di Bandar-Bandar Utama', srv:'🧭 Perkhidmatan Islam Lain', share:'🔗 Kongsi laman ini',
                  l_hijri_today:'Tarikh Hijrah Hari Ini', l_hijri_year:'Kalendar Hijrah 1447',
                  l_date_conv:'Penukar Tarikh', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram', popAria:'Bandar popular', svcAria:'Perkhidmatan Islam' },
        };
        const _cPopCityI18n = {
            ar: { mecca:'مكة المكرمة', medina:'المدينة المنورة', riyadh:'الرياض', jeddah:'جدة',
                  cairo:'القاهرة', istanbul:'إسطنبول', dubai:'دبي', amman:'عمّان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'الدار البيضاء', jerusalem:'القدس' },
            en: { mecca:'Mecca', medina:'Medina', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Cairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damascus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            fr: { mecca:'La Mecque', medina:'Médine', riyadh:'Riyad', jeddah:'Djeddah',
                  cairo:'Le Caire', istanbul:'Istanbul', dubai:'Dubaï', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damas', casablanca:'Casablanca', jerusalem:'Jérusalem' },
            tr: { mecca:'Mekke', medina:'Medine', riyadh:'Riyad', jeddah:'Cidde',
                  cairo:'Kahire', istanbul:'İstanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bağdat', damascus:'Şam', casablanca:'Kazablanka', jerusalem:'Kudüs' },
            ur: { mecca:'مکہ مکرمہ', medina:'مدینہ منورہ', riyadh:'ریاض', jeddah:'جدہ',
                  cairo:'قاہرہ', istanbul:'استنبول', dubai:'دبئی', amman:'عمان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'کاسابلانکا', jerusalem:'یروشلم' },
            de: { mecca:'Mekka', medina:'Medina', riyadh:'Riad', jeddah:'Dschidda',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            id: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Yerusalem' },
            es: { mecca:'La Meca', medina:'Medina', riyadh:'Riad', jeddah:'Yeda',
                  cairo:'El Cairo', istanbul:'Estambul', dubai:'Dubái', amman:'Ammán',
                  baghdad:'Bagdad', damascus:'Damasco', casablanca:'Casablanca', jerusalem:'Jerusalén' },
            bn: { mecca:'মক্কা', medina:'মদিনা', riyadh:'রিয়াদ', jeddah:'জেদ্দা',
                  cairo:'কায়রো', istanbul:'ইস্তাম্বুল', dubai:'দুবাই', amman:'আম্মান',
                  baghdad:'বাগদাদ', damascus:'দামেস্ক', casablanca:'কাসাব্লাঙ্কা', jerusalem:'জেরুজালেম' },
            ms: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kaherah', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damsyik', casablanca:'Casablanca', jerusalem:'Baitulmaqdis' },
        };
        const _f = _cFooterI18n[lang] || _cFooterI18n.ar;
        const _pc = _cPopCityI18n[lang] || _cPopCityI18n.ar;
        // قالب "مواقيت الصلاة في {city}" — نفس قاموس index.html (prefix/postfix لكلّ لغة)
        const _cPrayerTimesInI18n = {
            ar: 'مواقيت الصلاة في {city}',
            en: 'Prayer Times in {city}',
            fr: 'Heures de prière à {city}',
            tr: '{city} için namaz vakitleri',
            ur: '{city} میں اوقاتِ نماز',
            de: 'Gebetszeiten in {city}',
            id: 'Jadwal Sholat di {city}',
            es: 'Horarios de Oración en {city}',
            bn: '{city}-এ নামাজের সময়',
            ms: 'Waktu Solat di {city}',
        };
        const _cPtTmpl = _cPrayerTimesInI18n[lang] || _cPrayerTimesInI18n.ar;

        // Titles + subtitles
        html = html
            .replace(/<h2 id="home-footer-links-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="home-footer-links-title" data-i18n="footer.popular_cities">${_escHtml(_f.pop)}</h2>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.services_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.services_title">${_escHtml(_f.srv)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.share_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.share_title">${_escHtml(_f.share)}</div>`);

        // Popular cities aria + names + locale prefix
        html = html.replace(
            /<nav class="popular-cities-grid" aria-label="[^"]*">/,
            `<nav class="popular-cities-grid" aria-label="${_escHtml(_f.popAria)}">`
        );
        html = html.replace(
            /<a href="[^"]*\/prayer-times-in-(mecca|medina|riyadh|jeddah|cairo|istanbul|dubai|amman|baghdad|damascus|casablanca|jerusalem)"[^>]*>[\s\S]*?<\/a>/g,
            (m, slug) => {
                const name = _pc[slug];
                // "مواقيت الصلاة في <strong>{city}</strong>" — نُرمِّز pre/post منفصلَين
                // لإبقاء وسم `<strong>` حول اسم المدينة فقط.
                const [pre, post] = _cPtTmpl.split('{city}');
                const label = `${_escHtml(pre)}<strong>${_escHtml(name)}</strong>${_escHtml(post)}`;
                return `<a href="${_langPrefix}/prayer-times-in-${slug}" data-i18n="popular_city.${slug}">${label}</a>`;
            }
        );
        html = html.replace(
            /<nav class="home-services-links" aria-label="[^"]*">/,
            `<nav class="home-services-links" aria-label="${_escHtml(_f.svcAria)}">`
        );

        // Services links text
        html = html
            .replace(/<a href="[^"]*\/today-hijri-date" data-i18n="footer\.link_hijri_today">[^<]*<\/a>/,
                `<a href="${_langPrefix}/today-hijri-date" data-i18n="footer.link_hijri_today">${_escHtml(_f.l_hijri_today)}</a>`)
            .replace(/<a href="[^"]*\/hijri-calendar\/1447" data-i18n="footer\.link_hijri_year">[^<]*<\/a>/,
                `<a href="${_langPrefix}/hijri-calendar/1447" data-i18n="footer.link_hijri_year">${_escHtml(_f.l_hijri_year)}</a>`)
            .replace(/<a href="[^"]*\/dateconverter" data-i18n="footer\.link_date_converter">[^<]*<\/a>/,
                `<a href="${_langPrefix}/dateconverter" data-i18n="footer.link_date_converter">${_escHtml(_f.l_date_conv)}</a>`)
            .replace(/<a href="[^"]*\/msbaha" data-i18n="footer\.link_tasbih">[^<]*<\/a>/,
                `<a href="${_langPrefix}/msbaha" data-i18n="footer.link_tasbih">${_escHtml(_f.l_tasbih)}</a>`);

        // Share buttons text
        html = html
            .replace(/<span data-i18n="footer\.share_x">[^<]*<\/span>/, `<span data-i18n="footer.share_x">${_escHtml(_f.x)}</span>`)
            .replace(/<span data-i18n="footer\.share_fb">[^<]*<\/span>/, `<span data-i18n="footer.share_fb">${_escHtml(_f.fb)}</span>`)
            .replace(/<span data-i18n="footer\.share_wa">[^<]*<\/span>/, `<span data-i18n="footer.share_wa">${_escHtml(_f.wa)}</span>`)
            .replace(/<span data-i18n="footer\.share_tg">[^<]*<\/span>/, `<span data-i18n="footer.share_tg">${_escHtml(_f.tg)}</span>`);

        // grid content
        html = html.replace(/<!-- COUNTRIES-GRID-CONTENT -->/, _buildCountriesGrid(lang));

        const buf = Buffer.from(html, 'utf8');
        const headers = {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Vary': 'Accept-Encoding'
        };
        if (acceptEnc && acceptEnc.includes('br')) {
            zlib.brotliCompress(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }, (e, zbuf) => {
                if (e) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding': 'br' }); res.end(zbuf);
            });
        } else if (acceptEnc && acceptEnc.includes('gzip')) {
            zlib.gzip(buf, (e, zbuf) => {
                if (e) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' }); res.end(zbuf);
            });
        } else {
            res.writeHead(200, headers); res.end(buf);
        }
    });
}

/**
 * يحلّل urlPath ويرجع كائن SEO كامل:
 *  { title, description, canonical, arUrl, enUrl, isEn, lang, siteName,
 *    ogType, ogImageUrl, robots, breadcrumbs: [{name, item}],
 *    geo: {lat, lng, country} | null, prev: url|null, next: url|null, article: {published, modified} | null }
 */
function buildSeoForPath(urlPath) {
    const origin = SITE_URL;
    let p = urlPath.replace(/\.html$/, '');
    if (p === '' || p === '/index') p = '/';

    // دعم 6 لغات: ar (افتراضي بدون prefix)، en، fr، tr، ur، de
    const SUPPORTED = ['en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
    let detectedLang = 'ar';
    let corePath = p;
    for (const l of SUPPORTED) {
        const m = p.match(new RegExp('^\\/' + l + '(\\/.*)?$'));
        if (m) { detectedLang = l; corePath = m[1] || '/'; break; }
    }
    const isEn = (detectedLang === 'en');
    const lang = detectedLang;
    const isRtl = (lang === 'ar' || lang === 'ur');
    // URL variants لكل لغة
    const langUrl = (l) => {
        const prefix = (l === 'ar') ? '' : ('/' + l);
        return origin + prefix + (corePath === '/' ? '/' : corePath);
    };
    const arUrl = langUrl('ar');
    const enUrl = langUrl('en');
    const frUrl = langUrl('fr');
    const trUrl = langUrl('tr');
    const urUrl = langUrl('ur');
    const deUrl = langUrl('de');
    const idUrl = langUrl('id');
    const esUrl = langUrl('es');
    const bnUrl = langUrl('bn');
    const msUrl = langUrl('ms');
    const canonical = origin + p;
    const SITE_NAMES = {
        ar: 'مواقيت الصلاة', en: 'Prayer Times', fr: 'Heures de Prière',
        tr: 'Namaz Vakitleri', ur: 'اوقاتِ نماز', de: 'Gebetszeiten',
        id: 'Jadwal Sholat',
        es: 'Horarios de Oración', bn: 'নামাজের সময়সূচী', ms: 'Waktu Solat'
    };
    const siteName = SITE_NAMES[lang] || SITE_NAMES.ar;

    // Defaults (homepage) — Round 7e: Keyword Consistency
    // Title يحوي: اليوم + مكة المكرمة + "الصلاة في" (phrase) + التاريخ الهجري
    // Description يحوي: اليوم + مكة + المدينة + الشهر الهجري الحالي ديناميكياً
    //                   (لإزالة Seobility "missing keywords" warnings)
    const _hNow = _hijriNow();
    const _hMonthSlug = _HIJRI_MONTHS_BY_ORDER[_hNow.month];
    const _hMonthAr = (_HIJRI_MONTHS[_hMonthSlug] || {}).ar || '';
    const _hMonthEn = (_HIJRI_MONTHS[_hMonthSlug] || {}).en || '';
    const _hYear = _hNow.year;
    const _gNow = new Date();
    const _gMonthIdx = _gNow.getMonth();
    const _gYear = _gNow.getFullYear();

    // Round 7h: أسماء الأشهر الميلاديّة مترجَمة لكلّ اللغات العشر — ضروريّ لإدراج
    // الشهر/السنة في Meta Description (phrase "أبريل 2026" في seoptimer).
    const _G_MONTHS = {
        ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
        en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
        fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
        tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
        ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
        de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
        id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
        es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
        bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
        ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],
    };
    const _gMonthAr = _G_MONTHS.ar[_gMonthIdx];
    const _gMonthEn = _G_MONTHS.en[_gMonthIdx];

    // Round 7g: Title ≤60 chars + Meta Desc 120-160 + exact-phrase matching
    // ترتيب الكلمات بحيث "مواقيت الصلاة في" و"الصلاة في" تظهر كـ exact phrases
    // (بدون كسرها بـ "اليوم" بينها — شرط seoptimer)
    // Round 7h: إضافة الشهر الميلاديّ (phrase "أبريل 2026" عالي التردّد في seoptimer)
    let title = isEn
        ? `Today's Prayer Times in Mecca & Medina | ${_hMonthEn} ${_hYear}`
        : `مواقيت الصلاة في مكة المكرمة اليوم | ${_hMonthAr} ${_hYear} هـ`;
    let description = isEn
        ? `Prayer times today in Mecca, Medina ${_gMonthEn} ${_gYear}: Fajr, Dhuhr, Asr, Maghrib, Isha. Hijri ${_hMonthEn} ${_hYear} AH, Qibla, Zakat.`
        : `مواقيت الصلاة في مكة المكرمة والمدينة اليوم ${_gMonthAr} ${_gYear}: الفجر، الظهر، العصر، المغرب، العشاء. التاريخ الهجري ${_hMonthAr} ${_hYear} هـ، القبلة والزكاة.`;
    let ogType = 'website';
    let geo = null;
    let prev = null, next = null, article = null;
    let webApp = null;           // WebApplication schema metadata (tool pages)
    let qiblaRef = null;         // Kaaba reference for /qibla-in-*
    let cityModified = null;     // dateModified for city pages
    // Localize homepage title/description for additional languages (fallback: AR)
    // Descriptions محسَّنة مع keywords اللغة + أسماء مدن flagship + الشهر الهجري ديناميكياً.
    // Round 7h: إدراج الشهر الميلاديّ المحلَّى (ً${_gMonthLoc}ً) لكلّ لغة
    if (lang === 'fr') {
        const _gMonthLoc = _G_MONTHS.fr[_gMonthIdx];
        title = `Heures de prière à La Mecque & Médine | ${_hMonthEn} ${_hYear}`;
        description = `Heures de prière aujourd'hui à La Mecque, Médine ${_gMonthLoc} ${_gYear} : Fajr, Dhuhr, Asr, Maghrib, Isha. Hégire ${_hMonthEn} ${_hYear}, Qibla, Zakat.`;
    } else if (lang === 'tr') {
        const _gMonthLoc = _G_MONTHS.tr[_gMonthIdx];
        title = `Namaz Vakitleri: Mekke, Medine, Dünya | ${_hMonthEn} ${_hYear}`;
        description = `Bugün Mekke, Medine namaz vakitleri ${_gMonthLoc} ${_gYear}: Fecir, Öğle, İkindi, Akşam, Yatsı. Hicri ${_hMonthEn} ${_hYear}, kıble, zekât.`;
    } else if (lang === 'ur') {
        const _gMonthLoc = _G_MONTHS.ur[_gMonthIdx];
        title = `اوقاتِ نماز: مکہ، مدینہ اور دنیا | ${_hMonthEn} ${_hYear}`;
        description = `آج مکہ مکرمہ، مدینہ اور دنیا میں اوقاتِ نماز ${_gMonthLoc} ${_gYear}: فجر، ظہر، عصر، مغرب، عشاء۔ ہجری کیلنڈر ${_hMonthEn} ${_hYear}، قبلہ، زکاۃ، دعائیں۔`;
    } else if (lang === 'de') {
        const _gMonthLoc = _G_MONTHS.de[_gMonthIdx];
        title = `Gebetszeiten — Mekka, Medina & Welt | ${_hMonthEn} ${_hYear}`;
        description = `Heutige Gebetszeiten in Mekka, Medina ${_gMonthLoc} ${_gYear}: Fajr, Dhuhr, Asr, Maghrib, Isha. Hidschri ${_hMonthEn} ${_hYear}, Qibla, Zakat.`;
    } else if (lang === 'id') {
        const _gMonthLoc = _G_MONTHS.id[_gMonthIdx];
        title = `Jadwal Sholat: Makkah, Madinah & Dunia | ${_hMonthEn} ${_hYear}`;
        description = `Jadwal sholat hari ini di Makkah, Madinah ${_gMonthLoc} ${_gYear}: Subuh, Zuhur, Asar, Magrib, Isya. Hijriah ${_hMonthEn} ${_hYear}, kiblat, zakat.`;
    } else if (lang === 'es') {
        const _gMonthLoc = _G_MONTHS.es[_gMonthIdx];
        title = `Horarios de Oración — La Meca, Medina | ${_hMonthEn} ${_hYear}`;
        description = `Horarios de oración hoy en La Meca, Medina ${_gMonthLoc} ${_gYear}: Fayr, Dhuhr, Asr, Magrib, Isha. Hijri ${_hMonthEn} ${_hYear}, Qibla, Zakat.`;
    } else if (lang === 'bn') {
        const _gMonthLoc = _G_MONTHS.bn[_gMonthIdx];
        title = `নামাজের সময়সূচী: মক্কা, মদিনা ও বিশ্ব | ${_hMonthEn} ${_hYear}`;
        description = `আজকের নামাজের সময় মক্কা, মদিনা ও বিশ্বের শহরগুলিতে ${_gMonthLoc} ${_gYear}: ফজর, জোহর, আসর, মাগরিব, এশা। হিজরি ক্যালেন্ডার ${_hMonthEn} ${_hYear}, কিবলা, যাকাত, দোয়া।`;
    } else if (lang === 'ms') {
        const _gMonthLoc = _G_MONTHS.ms[_gMonthIdx];
        title = `Waktu Solat: Makkah, Madinah & Dunia | ${_hMonthEn} ${_hYear}`;
        description = `Waktu solat hari ini di Makkah, Madinah ${_gMonthLoc} ${_gYear}: Subuh, Zohor, Asar, Maghrib, Isyak. Hijrah ${_hMonthEn} ${_hYear}, Kiblat, Zakat.`;
    }

    const HOME_LABELS = { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', tr: 'Ana Sayfa', ur: 'ہوم', de: 'Startseite', id: 'Beranda', es: 'Inicio', bn: 'হোম', ms: 'Utama' };
    const breadcrumbs = [{ name: HOME_LABELS[lang] || HOME_LABELS.ar, item: langUrl(lang) }];

    // ── Static tool pages ──
    const staticPages = {
        '/qibla': {
            title: [ 'Qibla Direction Finder — Online Compass to Mecca', 'اتجاه القبلة — بوصلة الكعبة المشرفة في مكة' ],
            desc:  [ 'Find the accurate Qibla direction from your location using GPS. Interactive compass and map to locate the Kaaba in Mecca.',
                     'تحديد اتجاه القبلة الدقيق من موقعك عبر GPS. بوصلة وخريطة تفاعلية لمعرفة اتجاه الكعبة المشرفة في مكة.' ],
            app: { category: 'UtilitiesApplication' },
        },
        '/moon': {
            title: [ 'Moon Today — Phase, Age & Illumination', 'القمر اليوم — الطور، العمر والإضاءة' ],
            desc:  [ "Track tonight's moon phase, age, illumination percentage, and upcoming moon events based on your location.",
                     'معلومات القمر اليوم: طور القمر، عمره، نسبة إضاءته، والأحداث القادمة حسب موقعك.' ],
            app: { category: 'UtilitiesApplication' },
        },
        '/zakat-calculator': {
            title: [ 'Zakat Calculator — Free Islamic Tool', 'حاسبة الزكاة — أداة إسلامية مجانية' ],
            desc:  [ 'Calculate your Zakat accurately with our free Islamic tool. Covers cash, gold, silver, stocks & investments.',
                     'احسب زكاتك بدقة عبر حاسبة الزكاة المجانية: النقد، الذهب، الفضة، الأسهم والاستثمارات.' ],
            app: { category: 'FinanceApplication' },
        },
        '/duas': {
            title: [ 'Duas & Athkar — Authentic Islamic Supplications', 'الأدعية والأذكار الصحيحة من الكتاب والسنة' ],
            desc:  [ 'Authentic duas from Quran & Sunnah: morning & evening athkar, after-prayer remembrance, sleep, travel, distress and Friday duas with sources.',
                     'أدعية وأذكار صحيحة من القرآن والسنة: أذكار الصباح والمساء، بعد الصلاة، النوم، السفر، الكرب، ويوم الجمعة — مع التخريج.' ],
            ogType: 'article',
        },
        '/msbaha': {
            title: {
                ar: 'المسبحة الإلكترونية — عدّاد الذكر اليومي',
                en: 'Digital Tasbih Counter — Masbaha for Dhikr',
                fr: 'Tasbih Numérique — Compteur de Dhikr',
                tr: 'Dijital Tesbih — Zikir Sayacı',
                ur: 'ڈیجیٹل تسبیح — روزانہ ذکر کا شمار',
                de: 'Digitale Tasbih — Dhikr-Zähler',
                id: 'Tasbih Digital — Penghitung Dzikir Harian',
                es: 'Tasbih Digital — Contador de Dhikr',
                bn: 'ডিজিটাল তাসবিহ — দৈনিক জিকির কাউন্টার',
                ms: 'Tasbih Digital — Pengira Zikir Harian',
            },
            desc: {
                ar: 'مسبحة إلكترونية مجانية تحفظ عدد الأذكار بين الجلسات. تابع تسبيحك اليومي: سبحان الله، الحمد لله، الله أكبر، أو حدّد ذكراً مخصّصاً وهدفاً.',
                en: 'Free digital tasbih counter that saves your dhikr count between sessions. Track Subhanallah, Alhamdulillah, Allahu Akbar and custom dhikr targets.',
                fr: 'Compteur de tasbih numérique gratuit qui sauvegarde votre compte de dhikr entre les sessions. Suivez Subhanallah, Alhamdulillah, Allahu Akbar et des cibles personnalisées.',
                tr: 'Oturumlar arasında zikir sayınızı kaydeden ücretsiz dijital tesbih sayacı. Subhanallah, Elhamdulillah, Allahu Ekber ve özel zikir hedeflerini takip edin.',
                ur: 'مفت ڈیجیٹل تسبیح کاؤنٹر جو آپ کے ذکر کی گنتی محفوظ رکھتا ہے۔ سبحان اللہ، الحمد للہ، اللہ اکبر اور اپنے حسب ضرورت ذکر کا ہدف مقرر کریں۔',
                de: 'Kostenloser digitaler Tasbih-Zähler, der Ihren Dhikr-Zählstand zwischen Sitzungen speichert. Zählen Sie Subhanallah, Alhamdulillah, Allahu Akbar und eigene Ziele.',
                id: 'Tasbih digital gratis yang menyimpan hitungan dzikir antar sesi. Pantau Subhanallah, Alhamdulillah, Allahu Akbar dan target dzikir kustom.',
                es: 'Contador de tasbih digital gratuito que guarda su conteo de dhikr entre sesiones. Registre Subhanallah, Alhamdulillah, Allahu Akbar y objetivos personalizados.',
                bn: 'বিনামূল্যে ডিজিটাল তাসবিহ কাউন্টার যা সেশনের মধ্যে আপনার জিকিরের সংখ্যা সংরক্ষণ করে। সুবহানাল্লাহ, আলহামদুলিল্লাহ, আল্লাহু আকবার এবং কাস্টম জিকির ট্র্যাক করুন।',
                ms: 'Pengira tasbih digital percuma yang menyimpan kiraan zikir anda antara sesi. Jejaki Subhanallah, Alhamdulillah, Allahu Akbar dan sasaran zikir tersuai.',
            },
            app: { category: 'UtilitiesApplication' },
        },
        '/dateconverter': {
            title: {
                ar: 'محوّل التاريخ الهجري إلى الميلادي وبالعكس',
                en: 'Hijri to Gregorian Date Converter (Two-Way)',
                fr: 'Convertisseur de Date Hégirienne ↔ Grégorienne',
                tr: 'Hicri ↔ Miladi Tarih Dönüştürücü',
                ur: 'ہجری ↔ میلادی تاریخ کنورٹر',
                de: 'Hidschri ↔ Gregorianisch Datumsumrechner',
                id: 'Konverter Tanggal Hijriyah ↔ Masehi',
                es: 'Conversor de Fecha Hijri ↔ Gregoriana',
                bn: 'হিজরি ↔ গ্রেগরিয়ান তারিখ রূপান্তরকারী',
                ms: 'Penukar Tarikh Hijrah ↔ Gregorian',
            },
            desc: {
                ar: 'حوِّل التاريخ بين الهجري والميلادي لأي سنة من 1 هـ حتى 1500 هـ. يعتمد على تقويم أم القرى ويُظهر اليوم من الأسبوع والأحداث التاريخية.',
                en: 'Convert Hijri to Gregorian and vice versa for any year from 1 AH to 1500 AH. Based on Umm al-Qura calendar with weekday and historical event lookup.',
                fr: 'Convertissez entre dates hégiriennes et grégoriennes de 1 AH à 1500 AH. Basé sur le calendrier Umm al-Qura avec jour de semaine et événements historiques.',
                tr: '1 H\'den 1500 H\'ye kadar herhangi bir yıl için Hicri ile Miladi arasında tarih dönüştürün. Ümmü\'l-Kura takvimi esaslı; haftanın günü ve tarihi olaylar dahil.',
                ur: '1 ہجری سے 1500 ہجری تک کسی بھی سال کے لیے ہجری اور میلادی تاریخ میں تبدیلی۔ ام القرى کیلنڈر پر مبنی، ہفتے کا دن اور تاریخی واقعات۔',
                de: 'Konvertieren Sie Hidschri in Gregorianisch und umgekehrt für jedes Jahr von 1 AH bis 1500 AH. Basierend auf dem Umm al-Qura-Kalender mit Wochentag und historischen Ereignissen.',
                id: 'Konversi tanggal Hijriyah ke Masehi dan sebaliknya untuk tahun 1 H hingga 1500 H. Berbasis kalender Umm al-Qura dengan hari dalam seminggu dan peristiwa sejarah.',
                es: 'Convierte fechas Hijri a gregorianas y viceversa para cualquier año de 1 AH a 1500 AH. Basado en el calendario Umm al-Qura con día de la semana y eventos históricos.',
                bn: '১ হিজরি থেকে ১৫০০ হিজরি পর্যন্ত যেকোনো বছরের জন্য হিজরি থেকে গ্রেগরিয়ান এবং বিপরীতে তারিখ রূপান্তর করুন। উম্মুল কুরা ক্যালেন্ডার-ভিত্তিক, সপ্তাহের দিন ও ঐতিহাসিক ঘটনা সহ।',
                ms: 'Tukar tarikh Hijrah ke Gregorian dan sebaliknya untuk mana-mana tahun dari 1 H hingga 1500 H. Berdasarkan kalendar Umm al-Qura dengan hari minggu dan peristiwa bersejarah.',
            },
            app: { category: 'UtilitiesApplication' },
        },
        '/today-hijri-date': {
            title: {
                ar: 'التاريخ الهجري اليوم',
                en: "Today's Hijri Date",
                fr: "Date Hijri d'aujourd'hui",
                tr: "Bugünün Hicri Tarihi",
                ur: 'آج کی ہجری تاریخ',
                de: 'Heutiges Hidschri-Datum',
                id: 'Tanggal Hijriyah Hari Ini',
                es: 'Fecha Hijri de Hoy',
                bn: 'আজকের হিজরি তারিখ',
                ms: 'Tarikh Hijrah Hari Ini',
            },
            desc: {
                ar: 'التاريخ الهجري اليوم مع مقابله الميلادي — محدَّث يومياً وفقاً لتقويم أم القرى.',
                en: "Find today's accurate Hijri (Islamic) date and its Gregorian equivalent — updated daily from Umm al-Qura calendar.",
                fr: "Trouvez la date hégirienne (islamique) exacte d'aujourd'hui et son équivalent grégorien — mise à jour quotidienne selon le calendrier Umm al-Qura.",
                tr: "Bugünün doğru Hicri (İslami) tarihini ve Miladi karşılığını bulun — Ümmü'l-Kura takvimine göre günlük güncellenir.",
                ur: 'آج کی درست ہجری (اسلامی) تاریخ اور اس کی میلادی مماثلت تلاش کریں — ام القرى کیلنڈر کے مطابق روزانہ اپ ڈیٹ۔',
                de: 'Finden Sie das heutige exakte Hidschri-Datum (islamisches Datum) und sein gregorianisches Äquivalent — täglich gemäß dem Umm al-Qura-Kalender aktualisiert.',
                id: 'Temukan tanggal Hijriyah (Islam) hari ini yang akurat dan padanan Masehinya — diperbarui setiap hari dari kalender Umm al-Qura.',
                es: "Encuentra la fecha Hijri (islámica) exacta de hoy y su equivalente gregoriana — actualizada diariamente según el calendario Umm al-Qura.",
                bn: 'আজকের নির্ভুল হিজরি (ইসলামিক) তারিখ এবং এর গ্রেগরিয়ান সমতুল্য খুঁজুন — উম্মুল কুরা ক্যালেন্ডার অনুযায়ী প্রতিদিন আপডেট।',
                ms: 'Cari tarikh Hijrah (Islam) hari ini yang tepat dan padanannya dalam kalendar Gregorian — dikemas kini setiap hari mengikut kalendar Umm al-Qura.',
            },
            ogType: 'article',
        },
        '/privacy': {
            title: {
                ar: 'سياسة الخصوصية — مواقيت الصلاة',
                en: 'Privacy Policy — Prayer Times',
                fr: 'Politique de confidentialité — Heures de Prière',
                tr: 'Gizlilik Politikası — Namaz Vakitleri',
                ur: 'پرائیویسی پالیسی — اوقاتِ نماز',
                de: 'Datenschutzerklärung — Gebetszeiten',
                id: 'Kebijakan Privasi — Jadwal Sholat',
                es: 'Política de Privacidad — Horarios de Oración',
                bn: 'গোপনীয়তা নীতি — নামাজের সময়সূচী',
                ms: 'Dasar Privasi — Waktu Solat',
            },
            desc: {
                ar: 'سياسة خصوصية الموقع: ما البيانات التي نجمعها (الموقع، اللغة)، استخدام ملفات تعريف الارتباط، الخدمات الخارجية، وحقوقك في بياناتك.',
                en: 'Our privacy policy explains what data we collect (location, language preference), how cookies are used, third-party services, and your data rights.',
                fr: 'Notre politique de confidentialité explique quelles données nous collectons (localisation, langue), l\u2019utilisation des cookies, les services tiers et vos droits.',
                tr: 'Gizlilik politikamız: hangi verileri topladığımız (konum, dil), çerezlerin nasıl kullanıldığı, üçüncü taraf hizmetler ve veri haklarınız.',
                ur: 'ہماری پرائیویسی پالیسی: ہم کون سا ڈیٹا جمع کرتے ہیں (مقام، زبان)، کوکیز کا استعمال، تیسرے فریق کی خدمات، اور آپ کے ڈیٹا کے حقوق۔',
                de: 'Unsere Datenschutzerklärung erläutert, welche Daten wir erheben (Standort, Spracheinstellung), die Verwendung von Cookies, Dienste Dritter und Ihre Datenrechte.',
                id: 'Kebijakan privasi situs: data apa yang kami kumpulkan (lokasi, bahasa), penggunaan cookie, layanan pihak ketiga, dan hak Anda atas data Anda.',
                es: 'Nuestra política de privacidad: qué datos recopilamos (ubicación, idioma), uso de cookies, servicios de terceros y sus derechos sobre los datos.',
                bn: 'আমাদের গোপনীয়তা নীতি: আমরা কোন ডেটা সংগ্রহ করি (অবস্থান, ভাষা), কুকিজের ব্যবহার, তৃতীয় পক্ষের সেবা এবং আপনার ডেটার অধিকার।',
                ms: 'Dasar privasi kami: data yang kami kumpulkan (lokasi, bahasa), penggunaan kuki, perkhidmatan pihak ketiga, dan hak anda atas data.',
            },
            ogType: 'article',
        },
        '/terms': {
            title: {
                ar: 'شروط الاستخدام — مواقيت الصلاة',
                en: 'Terms of Use — Prayer Times',
                fr: 'Conditions d\u2019utilisation — Heures de Prière',
                tr: 'Kullanım Şartları — Namaz Vakitleri',
                ur: 'شرائط استعمال — اوقاتِ نماز',
                de: 'Nutzungsbedingungen — Gebetszeiten',
                id: 'Syarat Penggunaan — Jadwal Sholat',
                es: 'Términos de Uso — Horarios de Oración',
                bn: 'ব্যবহারের শর্তাবলী — নামাজের সময়সূচী',
                ms: 'Terma Penggunaan — Waktu Solat',
            },
            desc: {
                ar: 'شروط استخدام موقع مواقيت الصلاة: وصف الخدمة، إخلاء المسؤولية عن الدقة، التزامات المستخدم، الملكية الفكرية وحدود المسؤولية.',
                en: 'Terms of use governing access to Prayer Times website: service description, accuracy disclaimer, user obligations, intellectual property and limitation of liability.',
                fr: 'Conditions régissant l\u2019accès au site Heures de Prière : description du service, avertissement sur l\u2019exactitude, obligations de l\u2019utilisateur, propriété intellectuelle et limitation de responsabilité.',
                tr: 'Namaz Vakitleri web sitesine erişimi düzenleyen kullanım şartları: hizmet tanımı, doğruluk sorumluluk reddi, kullanıcı yükümlülükleri, fikri mülkiyet ve sorumluluk sınırlaması.',
                ur: 'اوقاتِ نماز ویب سائٹ تک رسائی کو منظم کرنے والی شرائط استعمال: سروس کی تفصیل، درستگی سے دستبرداری، صارف کی ذمہ داریاں، املاک دانش اور ذمہ داری کی حد۔',
                de: 'Nutzungsbedingungen für den Zugriff auf die Gebetszeiten-Webseite: Dienstbeschreibung, Genauigkeitshinweis, Nutzerpflichten, geistiges Eigentum und Haftungsbeschränkung.',
                id: 'Syarat penggunaan yang mengatur akses ke situs Jadwal Sholat: deskripsi layanan, penafian keakuratan, kewajiban pengguna, kekayaan intelektual dan batasan tanggung jawab.',
                es: 'Términos que rigen el acceso al sitio Horarios de Oración: descripción del servicio, aviso de precisión, obligaciones del usuario, propiedad intelectual y limitación de responsabilidad.',
                bn: 'নামাজের সময়সূচী ওয়েবসাইটে প্রবেশের শর্তাবলী: সেবার বিবরণ, নির্ভুলতার দাবিত্যাগ, ব্যবহারকারীর বাধ্যবাধকতা, মেধাস্বত্ব ও দায়বদ্ধতার সীমা।',
                ms: 'Terma yang mengawal akses ke laman Waktu Solat: penerangan perkhidmatan, penafian ketepatan, obligasi pengguna, harta intelek dan had liabiliti.',
            },
            ogType: 'article',
        },
        '/contact': {
            title: {
                ar: 'اتصل بنا — مواقيت الصلاة',
                en: 'Contact Us — Prayer Times',
                fr: 'Contact — Heures de Prière',
                tr: 'İletişim — Namaz Vakitleri',
                ur: 'ہم سے رابطہ کریں — اوقاتِ نماز',
                de: 'Kontakt — Gebetszeiten',
                id: 'Hubungi Kami — Jadwal Sholat',
                es: 'Contáctenos — Horarios de Oración',
                bn: 'যোগাযোগ করুন — নামাজের সময়সূচী',
                ms: 'Hubungi Kami — Waktu Solat',
            },
            desc: {
                ar: 'تواصل مع فريق مواقيت الصلاة للدعم، الاقتراحات، الشراكات أو للإبلاغ عن مواقيت غير دقيقة في مدينتك.',
                en: 'Get in touch with the Prayer Times team for support, feedback, partnership inquiries or to report inaccurate prayer times in your city.',
                fr: 'Contactez l\u2019équipe Heures de Prière pour le support, les retours, les partenariats ou signaler des heures de prière inexactes dans votre ville.',
                tr: 'Destek, geri bildirim, ortaklık soruları veya şehrinizdeki yanlış namaz vakitlerini bildirmek için Namaz Vakitleri ekibiyle iletişime geçin.',
                ur: 'سپورٹ، تاثرات، شراکت داری کی پوچھ گچھ یا اپنے شہر میں غلط نماز کے اوقات کی اطلاع کے لیے اوقاتِ نماز ٹیم سے رابطہ کریں۔',
                de: 'Kontaktieren Sie das Gebetszeiten-Team für Support, Feedback, Partnerschaftsanfragen oder um ungenaue Gebetszeiten in Ihrer Stadt zu melden.',
                id: 'Hubungi tim Jadwal Sholat untuk dukungan, masukan, pertanyaan kemitraan, atau untuk melaporkan jadwal sholat yang tidak akurat di kota Anda.',
                es: 'Póngase en contacto con el equipo de Horarios de Oración para soporte, comentarios, consultas de asociación o reportar horarios inexactos en su ciudad.',
                bn: 'সহায়তা, মতামত, অংশীদারিত্বের প্রশ্ন বা আপনার শহরে ভুল নামাজের সময় রিপোর্ট করতে নামাজের সময়সূচী দলের সাথে যোগাযোগ করুন।',
                ms: 'Hubungi pasukan Waktu Solat untuk sokongan, maklum balas, pertanyaan perkongsian atau untuk melaporkan waktu solat tidak tepat di bandar anda.',
            },
            ogType: 'article',
        },
        '/about-us': {
            title: {
                ar: 'عن موقع مواقيت الصلاة — رسالتنا',
                en: 'About Prayer Times — Our Mission',
                fr: 'À propos d\u2019Heures de Prière — Notre mission',
                tr: 'Namaz Vakitleri Hakkında — Misyonumuz',
                ur: 'اوقاتِ نماز کے بارے میں — ہمارا مشن',
                de: 'Über Gebetszeiten — Unsere Mission',
                id: 'Tentang Jadwal Sholat — Misi Kami',
                es: 'Sobre Horarios de Oración — Nuestra Misión',
                bn: 'নামাজের সময়সূচী সম্পর্কে — আমাদের মিশন',
                ms: 'Tentang Waktu Solat — Misi Kami',
            },
            desc: {
                ar: 'تعرّف على موقع مواقيت الصلاة: رسالتنا في توفير مواقيت صلاة دقيقة، تقويم هجري، اتجاه قبلة وأدعية مجاناً للمسلمين حول العالم.',
                en: 'Learn about Prayer Times: our mission to provide accurate Islamic prayer schedules, Hijri calendar, Qibla direction and duas freely to Muslims worldwide.',
                fr: 'Découvrez Heures de Prière : notre mission de fournir gratuitement des horaires de prière précis, un calendrier hégirien, la direction de la Qibla et des invocations aux musulmans du monde entier.',
                tr: 'Namaz Vakitleri hakkında bilgi edinin: dünya çapındaki Müslümanlara doğru namaz vakitleri, Hicri takvim, Kıble yönü ve duaları ücretsiz sunma misyonumuz.',
                ur: 'اوقاتِ نماز کے بارے میں جانیں: دنیا بھر کے مسلمانوں کو درست نماز کے اوقات، ہجری کیلنڈر، قبلہ کی سمت اور دعائیں مفت فراہم کرنے کا ہمارا مشن۔',
                de: 'Erfahren Sie mehr über Gebetszeiten: unsere Mission, Muslimen weltweit präzise Gebetspläne, Hidschri-Kalender, Qibla-Richtung und Duas kostenlos anzubieten.',
                id: 'Pelajari tentang Jadwal Sholat: misi kami menyediakan jadwal sholat yang akurat, kalender Hijriah, arah kiblat, dan doa secara gratis untuk Muslim di seluruh dunia.',
                es: 'Conozca Horarios de Oración: nuestra misión de proporcionar gratuitamente horarios de oración precisos, calendario Hijri, dirección de la Qibla y duas a los musulmanes de todo el mundo.',
                bn: 'নামাজের সময়সূচী সম্পর্কে জানুন: বিশ্বের মুসলিমদের বিনামূল্যে সঠিক নামাজের সময়, হিজরি ক্যালেন্ডার, কিবলার দিক এবং দোয়া প্রদানের আমাদের মিশন।',
                ms: 'Ketahui tentang Waktu Solat: misi kami menyediakan jadual solat tepat, kalendar Hijrah, arah Kiblat dan doa secara percuma kepada umat Islam di seluruh dunia.',
            },
            ogType: 'article',
        },
    };

    if (staticPages[corePath]) {
        const sp = staticPages[corePath];
        // يدعم شكلين: مصفوفة [en, ar] (قديم) أو كائن {ar, en, fr, tr, ur} (جديد)
        const _pickField = (fld) => {
            const v = sp[fld];
            if (!v) return '';
            if (Array.isArray(v)) return (lang === 'ar') ? v[1] : v[0];
            return v[lang] || v.en || v.ar || '';
        };
        title = _pickField('title');
        description = _pickField('desc');
        if (sp.ogType) ogType = sp.ogType;
        if (sp.app) webApp = { name: title, url: canonical, category: sp.app.category };
        breadcrumbs.push({ name: title, item: canonical });
    }

    // للصفحات الديناميكية: استخدم النص الإنجليزي لـ EN/FR/TR/UR (احتياط) والعربي لـ AR فقط
    const useEnTxt = (lang !== 'ar');

    // ── City pages: /prayer-times-in-{slug}-{lat}-{lng} ──
    let m = corePath.match(/^\/prayer-times-in-(.+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (m) {
        const citySlug = m[1];
        const lat = parseFloat(m[2]);
        const lng = parseFloat(m[3]);
        const cityDisplay = _slugToTitle(citySlug);
        // عناوين مُثراة بكلمات مفتاحية SEO (~55 حرفاً) — قابلة للاستبدال من CSR
        const _baseTitle = useEnTxt ? `Prayer Times in ${cityDisplay}` : `مواقيت الصلاة في ${cityDisplay}`;
        const _suffix = useEnTxt ? ' — Fajr, Dhuhr, Asr, Maghrib, Isha' : ' — الفجر، الظهر، العصر، المغرب، العشاء';
        title = (_baseTitle + _suffix).length <= 60 ? _baseTitle + _suffix : _baseTitle;
        description = useEnTxt
            ? `Accurate Islamic prayer times for ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha, Qibla direction, today's Hijri date and weekly schedule.`
            : `مواقيت الصلاة الدقيقة في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء، اتجاه القبلة، التاريخ الهجري والجدول الأسبوعي.`;
        ogType = 'article';
        geo = { lat, lng };
        cityModified = new Date().toISOString();
        breadcrumbs.push({ name: cityDisplay, item: canonical });
    }

    // ── Qibla city pages: /qibla-in-{slug}-{lat}-{lng} ──
    m = corePath.match(/^\/qibla-in-(.+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (m) {
        const citySlug = m[1];
        const lat = parseFloat(m[2]);
        const lng = parseFloat(m[3]);
        const cityDisplay = _slugToTitle(citySlug);
        const _qBase = useEnTxt ? `Qibla Direction in ${cityDisplay}` : `اتجاه القبلة في ${cityDisplay}`;
        const _qSuf  = useEnTxt ? ' — Compass to the Kaaba in Mecca' : ' — بوصلة الكعبة في مكة';
        title = (_qBase + _qSuf).length <= 60 ? _qBase + _qSuf : _qBase;
        description = useEnTxt
            ? `Accurate Qibla direction from ${cityDisplay} to the Kaaba in Mecca, with exact bearing, compass and map view.`
            : `اتجاه القبلة الدقيق من ${cityDisplay} إلى الكعبة المشرفة في مكة، مع درجة الانحراف وبوصلة وخريطة تفاعلية.`;
        ogType = 'article';
        geo = { lat, lng };
        cityModified = new Date().toISOString();
        qiblaRef = { cityName: cityDisplay, lat, lng };
        breadcrumbs.push({ name: cityDisplay, item: canonical });
    }

    // ── About city pages: /about-{slug}-{lat}-{lng} ──
    m = corePath.match(/^\/about-(.+?)-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);
    if (m) {
        const citySlug = m[1];
        const lat = parseFloat(m[2]);
        const lng = parseFloat(m[3]);
        const cityDisplay = _slugToTitle(citySlug);
        const _aBase = useEnTxt ? `About ${cityDisplay}` : `عن مدينة ${cityDisplay}`;
        const _aSuf  = useEnTxt ? ' — Location, Timezone & Prayer Times' : ' — الموقع، المنطقة الزمنية ومواقيت الصلاة';
        title = (_aBase + _aSuf).length <= 60 ? _aBase + _aSuf : _aBase;
        description = useEnTxt
            ? `Discover ${cityDisplay}: geographic coordinates, timezone, population, Islamic prayer times, Qibla direction, today's Hijri date and key local facts.`
            : `تعرّف على مدينة ${cityDisplay}: الإحداثيات الجغرافية، المنطقة الزمنية، السكان، مواقيت الصلاة، اتجاه القبلة، التاريخ الهجري وأهم الحقائق المحلية.`;
        ogType = 'article';
        geo = { lat, lng };
        cityModified = new Date().toISOString();
        breadcrumbs.push({ name: cityDisplay, item: canonical });
    }

    // المسار للغة (بدون prefix لـ AR، وإلا /{lang})
    const langPrefix = (lang === 'ar') ? '' : ('/' + lang);

    // ── Hijri year: /hijri-calendar أو /hijri-calendar/{year} ──
    m = corePath.match(/^\/hijri-calendar(?:\/(\d{4}))?$/);
    if (m) {
        // إن لم تُحدَّد السنة في المسار → استخدم السنة الهجرية الحالية
        const year = m[1] || String(_hijriNow().year);
        // قوالب متعدّدة اللغات
        const _HY_TITLE = {
            ar: `التقويم الهجري لعام ${year} هـ`,
            en: `Hijri Calendar ${year} AH`,
            fr: `Calendrier hégirien ${year} H`,
            tr: `Hicri Takvim ${year} H`,
            ur: `ہجری کیلنڈر ${year} ہجری`,
            de: `Hidschri-Kalender ${year} AH`,
            id: `Kalender Hijriah ${year} H`,
            es: `Calendario Hégira ${year} H`,
            bn: `হিজরি ক্যালেন্ডার ${year} হিজরি`,
            ms: `Kalendar Hijrah ${year} H`,
        };
        const _HY_DESC = {
            ar: `التقويم الهجري الكامل لعام ${year} هـ مع جميع الأشهر الإثني عشر والأيام وتواريخها الميلادية من تقويم أم القرى.`,
            en: `Full Hijri calendar for year ${year} AH with all 12 months, days and their Gregorian dates from the Umm al-Qura calendar.`,
            fr: `Calendrier hégirien complet de l'année ${year} H avec les 12 mois, leurs jours et leurs dates grégoriennes selon le calendrier Umm al-Qura.`,
            tr: `${year} H yılının tam hicri takvimi — 12 ay, tüm günler ve Ümmülkura takvimine göre miladi karşılıkları.`,
            ur: `${year} ہجری کا مکمل ہجری کیلنڈر — تمام 12 مہینے، ان کے دن اور ام القری کیلنڈر کے مطابق عیسوی تاریخیں۔`,
            de: `Vollständiger Hidschri-Kalender für das Jahr ${year} AH mit allen 12 Monaten, Tagen und ihren gregorianischen Daten aus dem Umm-al-Qura-Kalender.`,
            id: `Kalender Hijriah lengkap tahun ${year} H dengan semua 12 bulan, hari, dan tanggal Masehi-nya dari kalender Umm al-Qura.`,
            es: `Calendario Hégira completo del año ${year} H con los 12 meses, sus días y fechas gregorianas según el calendario Umm al-Qura.`,
            bn: `${year} হিজরির সম্পূর্ণ হিজরি ক্যালেন্ডার — সব ১২টি মাস, তাদের দিন এবং উম্ম আল-কুরা ক্যালেন্ডার অনুসারে খ্রিস্টীয় তারিখ।`,
            ms: `Kalendar Hijrah lengkap bagi tahun ${year} H dengan kesemua 12 bulan, hari-harinya dan tarikh Masihi mengikut kalendar Umm al-Qura.`,
        };
        const _HY_CAL_LABEL = {
            ar: 'التقويم الهجري', en: 'Hijri Calendar', fr: 'Calendrier hégirien', tr: 'Hicri Takvim',
            ur: 'ہجری کیلنڈر', de: 'Hidschri-Kalender', id: 'Kalender Hijriah', es: 'Calendario Hégira',
            bn: 'হিজরি ক্যালেন্ডার', ms: 'Kalendar Hijrah'
        };
        title = _HY_TITLE[lang] || _HY_TITLE.en;
        description = _HY_DESC[lang] || _HY_DESC.en;
        ogType = 'article';
        breadcrumbs.push({ name: _HY_CAL_LABEL[lang] || _HY_CAL_LABEL.en, item: origin + langPrefix + `/hijri-calendar` });
        // prev/next: فقط إذا الـ URL يتضمّن سنة صريحة
        if (m[1]) {
            prev = origin + langPrefix + `/hijri-calendar/${parseInt(year) - 1}`;
            next = origin + langPrefix + `/hijri-calendar/${parseInt(year) + 1}`;
        }
        article = { published: `${parseInt(year)}-01-01T00:00:00Z`, modified: new Date().toISOString() };
    }

    // ── Hijri month: /hijri-calendar/{month-slug}-{year} ──
    m = corePath.match(/^\/hijri-calendar\/([a-z-]+)-(\d+)$/);
    if (m) {
        const monthSlug = m[1];
        const year = m[2];
        const info = _HIJRI_MONTHS[monthSlug];
        const _HM_BY_LANG_M = {
            ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
            en: ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Jumada al-Ula','Jumada al-Akhira','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'],
            fr: ['Mouharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal',"Dhou al-Qi'da",'Dhou al-Hijja'],
            tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
            ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
            de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
            id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
            es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qi‘da','Du al-Hiyya'],
            bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
            ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
        };
        const _hSfxM = { ar:' هـ', en:' AH', fr:' H', tr:' H', ur:' ہجری', de:' AH', id:' H', es:' H', bn:' হিজরি', ms:' H' }[lang] || ' AH';
        const _mName = info ? (_HM_BY_LANG_M[lang] ? _HM_BY_LANG_M[lang][info.order - 1] : (info.en))
                            : _slugToTitle(monthSlug);
        const _HMO_TITLE = {
            ar: `التقويم الهجري لشهر ${_mName} ${year}${_hSfxM}`,
            en: `Hijri Calendar: ${_mName} ${year}${_hSfxM}`,
            fr: `Calendrier hégirien : ${_mName} ${year}${_hSfxM}`,
            tr: `Hicri Takvim: ${_mName} ${year}${_hSfxM}`,
            ur: `ہجری کیلنڈر: ${_mName} ${year}${_hSfxM}`,
            de: `Hidschri-Kalender: ${_mName} ${year}${_hSfxM}`,
            id: `Kalender Hijriah: ${_mName} ${year}${_hSfxM}`,
            es: `Calendario Hégira: ${_mName} ${year}${_hSfxM}`,
            bn: `হিজরি ক্যালেন্ডার: ${_mName} ${year}${_hSfxM}`,
            ms: `Kalendar Hijrah: ${_mName} ${year}${_hSfxM}`,
        };
        const _HMO_DESC = {
            ar: `التقويم الهجري الكامل لشهر ${_mName} ${year}${_hSfxM} مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى.`,
            en: `Full Hijri calendar for ${_mName} ${year}${_hSfxM} with the Gregorian date for each day, per the Umm al-Qura calendar.`,
            fr: `Calendrier hégirien complet de ${_mName} ${year}${_hSfxM} avec la date grégorienne de chaque jour, selon le calendrier Umm al-Qura.`,
            tr: `${_mName} ${year}${_hSfxM} için tam hicri takvim, her günün miladi tarihiyle, Ümmülkura takvimine göre.`,
            ur: `${_mName} ${year}${_hSfxM} کا مکمل ہجری کیلنڈر، ہر دن کی عیسوی تاریخ کے ساتھ، ام القری کیلنڈر کے مطابق۔`,
            de: `Vollständiger Hidschri-Kalender für ${_mName} ${year}${_hSfxM} mit gregorianischem Datum für jeden Tag, gemäß dem Umm-al-Qura-Kalender.`,
            id: `Kalender Hijriah lengkap untuk ${_mName} ${year}${_hSfxM} dengan tanggal Masehi setiap hari, menurut kalender Umm al-Qura.`,
            es: `Calendario Hégira completo de ${_mName} ${year}${_hSfxM} con la fecha gregoriana de cada día, según el calendario Umm al-Qura.`,
            bn: `${_mName} ${year}${_hSfxM}-এর সম্পূর্ণ হিজরি ক্যালেন্ডার প্রতিটি দিনের খ্রিস্টীয় তারিখসহ, উম্ম আল-কুরা ক্যালেন্ডার অনুযায়ী।`,
            ms: `Kalendar Hijrah lengkap bagi ${_mName} ${year}${_hSfxM} dengan tarikh Masihi bagi setiap hari, mengikut kalendar Umm al-Qura.`,
        };
        const _HMO_CAL_LBL = {
            ar: 'التقويم الهجري', en: 'Hijri Calendar', fr: 'Calendrier hégirien', tr: 'Hicri Takvim',
            ur: 'ہجری کیلنڈر', de: 'Hidschri-Kalender', id: 'Kalender Hijriah', es: 'Calendario Hégira',
            bn: 'হিজরি ক্যালেন্ডার', ms: 'Kalendar Hijrah'
        };
        title = _HMO_TITLE[lang] || _HMO_TITLE.en;
        description = _HMO_DESC[lang] || _HMO_DESC.en;
        ogType = 'article';
        breadcrumbs.push({ name: _HMO_CAL_LBL[lang] || _HMO_CAL_LBL.en, item: origin + langPrefix + `/hijri-calendar` });
        breadcrumbs.push({ name: `${year}${_hSfxM}`, item: origin + langPrefix + `/hijri-calendar/${year}` });
        breadcrumbs.push({ name: `${_mName} ${year}${_hSfxM}`, item: canonical });
        // prev/next month navigation
        if (info) {
            const prevOrder = info.order === 1 ? 12 : info.order - 1;
            const prevYear = info.order === 1 ? parseInt(year) - 1 : parseInt(year);
            const nextOrder = info.order === 12 ? 1 : info.order + 1;
            const nextYear = info.order === 12 ? parseInt(year) + 1 : parseInt(year);
            prev = origin + langPrefix + `/hijri-calendar/${_HIJRI_MONTHS_BY_ORDER[prevOrder]}-${prevYear}`;
            next = origin + langPrefix + `/hijri-calendar/${_HIJRI_MONTHS_BY_ORDER[nextOrder]}-${nextYear}`;
        }
        article = { published: `${parseInt(year)}-01-01T00:00:00Z`, modified: new Date().toISOString() };
    }

    // ── Hijri day: /hijri-date/{day}-{month-slug}-{year} ──
    m = corePath.match(/^\/hijri-date\/(\d+)-([a-z-]+)-(\d+)$/);
    if (m) {
        const day = m[1];
        const monthSlug = m[2];
        const year = m[3];
        const info = _HIJRI_MONTHS[monthSlug];
        const monthAr = info ? info.ar : _slugToTitle(monthSlug);
        const monthEn = info ? info.en : _slugToTitle(monthSlug);
        // أسماء الأشهر الهجرية المُترجَمة لكل لغة (10 لغات)
        const _HM_BY_LANG = {
            ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
            en: ['Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Jumada al-Ula','Jumada al-Akhira','Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'],
            fr: ['Mouharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Joumada al-Oula','Joumada al-Thania','Rajab','Chaabane','Ramadan','Chawwal',"Dhou al-Qi'da",'Dhou al-Hijja'],
            tr: ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Recep','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'],
            ur: ['محرّم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'],
            de: ['Muharram','Safar','Rabīʿ al-awwal','Rabīʿ ath-thānī','Dschumādā l-ūlā','Dschumādā th-thāniya','Radschab','Schaʿbān','Ramadan','Schawwāl','Dhū l-qaʿda','Dhū l-hidscha'],
            id: ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Zulkaidah','Zulhijah'],
            es: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Yumada al-Awwal','Yumada al-Thani','Rayab','Shaabán','Ramadán','Shawwal','Du al-Qi‘da','Du al-Hiyya'],
            bn: ['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'],
            ms: ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
        };
        const _mName  = info ? (_HM_BY_LANG[lang] ? _HM_BY_LANG[lang][info.order - 1] : monthEn) : monthEn;
        const _hSfx   = { ar:' هـ', en:' AH', fr:' H', tr:' H', ur:' ہجری', de:' AH', id:' H', es:' H', bn:' হিজরি', ms:' H' }[lang] || ' AH';
        // قوالب العناوين والأوصاف لكل لغة
        const _HDAY_TITLE = {
            ar: `${day} ${_mName} ${year}${_hSfx} — التاريخ الهجري والميلادي`,
            en: `${day} ${_mName} ${year}${_hSfx} — Islamic Date with Gregorian Equivalent`,
            fr: `${day} ${_mName} ${year}${_hSfx} — Date hégirienne et équivalent grégorien`,
            tr: `${day} ${_mName} ${year}${_hSfx} — Hicri ve Miladi Tarih`,
            ur: `${day} ${_mName} ${year}${_hSfx} — ہجری اور عیسوی تاریخ`,
            de: `${day} ${_mName} ${year}${_hSfx} — Hidschri-Datum mit gregorianischer Entsprechung`,
            id: `${day} ${_mName} ${year}${_hSfx} — Tanggal Hijriah dan Masehi`,
            es: `${day} ${_mName} ${year}${_hSfx} — Fecha Hégira con equivalente gregoriano`,
            bn: `${day} ${_mName} ${year}${_hSfx} — হিজরি ও খ্রিস্টীয় তারিখ`,
            ms: `${day} ${_mName} ${year}${_hSfx} — Tarikh Hijrah dan Masihi`,
        };
        const _HDAY_DESC = {
            ar: `التاريخ الهجري ${day} ${_mName} ${year}${_hSfx} مع مقابله الميلادي الدقيق والأحداث والخلفية التاريخية لهذا اليوم.`,
            en: `The Hijri (Islamic) date ${day} ${_mName} ${year}${_hSfx} with its exact Gregorian equivalent, events and historical background.`,
            fr: `La date hégirienne ${day} ${_mName} ${year}${_hSfx} avec son équivalent grégorien exact, les événements et le contexte historique de ce jour.`,
            tr: `${day} ${_mName} ${year}${_hSfx} hicri tarihi, miladi karşılığı, bu günün olayları ve tarihsel arka planı.`,
            ur: `ہجری تاریخ ${day} ${_mName} ${year}${_hSfx} کا عیسوی مقابلہ، اس دن کے واقعات اور تاریخی پس منظر۔`,
            de: `Das Hidschri-Datum ${day} ${_mName} ${year}${_hSfx} mit seiner gregorianischen Entsprechung, Ereignissen und historischem Hintergrund.`,
            id: `Tanggal Hijriah ${day} ${_mName} ${year}${_hSfx} dengan padanan Masehi, peristiwa dan latar belakang sejarah hari ini.`,
            es: `La fecha Hégira ${day} ${_mName} ${year}${_hSfx} con su equivalente gregoriano exacto, eventos y contexto histórico.`,
            bn: `হিজরি তারিখ ${day} ${_mName} ${year}${_hSfx} এর খ্রিস্টীয় সমতুল্য, এই দিনের ঘটনা ও ঐতিহাসিক পটভূমি।`,
            ms: `Tarikh Hijrah ${day} ${_mName} ${year}${_hSfx} dengan padanan Masihi, peristiwa dan latar belakang sejarah hari ini.`,
        };
        const _HDAY_CAL_LABEL = {
            ar: 'التقويم الهجري', en: 'Hijri Calendar', fr: 'Calendrier hégirien', tr: 'Hicri Takvim',
            ur: 'ہجری کیلنڈر', de: 'Hidschri-Kalender', id: 'Kalender Hijriah', es: 'Calendario Hégira',
            bn: 'হিজরি ক্যালেন্ডার', ms: 'Kalendar Hijrah'
        };
        title = _HDAY_TITLE[lang] || _HDAY_TITLE.en;
        description = _HDAY_DESC[lang] || _HDAY_DESC.en;
        ogType = 'article';
        const _calL = _HDAY_CAL_LABEL[lang] || _HDAY_CAL_LABEL.en;
        breadcrumbs.push({ name: _calL, item: origin + langPrefix + `/hijri-calendar/${year}` });
        breadcrumbs.push({ name: `${_mName} ${year}`, item: origin + langPrefix + `/hijri-calendar/${monthSlug}-${year}` });
        breadcrumbs.push({ name: `${day} ${_mName}`, item: canonical });
        article = { published: `${parseInt(year)}-01-01T00:00:00Z`, modified: new Date().toISOString() };
    }

    // ── Country listing: /prayer-times-in-{country-slug} ──
    // ملاحظة: النمط نفسه (/prayer-times-in-{slug}) يُستخدم للمدن أيضاً.
    // نحن نفحص عبر _countryFromSlug ليرى إن كان slug يطابق دولة معروفة.
    // لو نعم → صفحة دولة (cities listing). لو لا → المسار يكمل لمنطق المدن.
    let countryListing = null;
    m = corePath.match(/^\/prayer-times-in-([a-z][a-z0-9-]+)$/);
    if (m) {
        const slug = m[1];
        const c = _countryFromSlug(slug);
        if (c && c.cc && c.cc !== '__') {
            // اسم الدولة بـلغة الواجهة (يدعم 6 لغات): ar/en/fr/tr/ur/de
            const cname = _countryNameForLang(c.cc, lang);
            const _COUNTRY_TITLE_TEMPLATES = {
                ar: `مواقيت الصلاة في مدن ${cname}`,
                en: `Prayer Times in Cities of ${cname}`,
                fr: `Heures de prière dans les villes de ${cname}`,
                tr: `${cname} Şehirlerinde Namaz Vakitleri`,
                ur: `${cname} کے شہروں میں اوقاتِ نماز`,
                de: `Gebetszeiten in den Städten von ${cname}`,
                id: `Jadwal Sholat di Kota-Kota ${cname}`,
            };
            const _COUNTRY_DESC_TEMPLATES = {
                ar: `تصفّح جميع مدن ${cname} لمعرفة مواقيت الصلاة الدقيقة (الفجر، الظهر، العصر، المغرب، العشاء)، اتجاه القبلة والتاريخ الهجري والجدول الأسبوعي.`,
                en: `Browse every city in ${cname} for accurate Fajr, Dhuhr, Asr, Maghrib & Isha prayer times, Qibla direction and today's Hijri date with weekly schedule.`,
                fr: `Parcourez toutes les villes de ${cname} pour des heures de prière précises (Fajr, Dhuhr, Asr, Maghrib, Isha), la direction de la Qibla, la date hégirienne du jour et le programme hebdomadaire.`,
                tr: `${cname} şehirlerinde doğru namaz vakitleri (Fecir, Öğle, İkindi, Akşam, Yatsı), kıble yönü, bugünkü hicri tarih ve haftalık program için tüm şehirlere göz atın.`,
                ur: `${cname} کے ہر شہر کے لیے درست اوقاتِ نماز (فجر، ظہر، عصر، مغرب، عشاء)، سمتِ قبلہ، آج کی ہجری تاریخ اور ہفتہ وار جدول دیکھیں۔`,
                de: `Durchsuchen Sie alle Städte in ${cname} für genaue Gebetszeiten (Fajr, Dhuhr, Asr, Maghrib, Isha), Qibla-Richtung, das heutige Hidschri-Datum und den Wochenplan.`,
                id: `Jelajahi setiap kota di ${cname} untuk mendapatkan jadwal sholat akurat (Subuh, Zuhur, Asar, Magrib, Isya), arah Kiblat, tanggal Hijriyah hari ini, dan jadwal mingguan.`,
            };
            title = _COUNTRY_TITLE_TEMPLATES[lang] || _COUNTRY_TITLE_TEMPLATES.en;
            description = _COUNTRY_DESC_TEMPLATES[lang] || _COUNTRY_DESC_TEMPLATES.en;
            breadcrumbs.push({ name: cname, item: canonical });
            countryListing = { code: c.cc, name: cname };
        }
    }

    // OG image URL (dynamic SVG endpoint)
    const ogImageUrl = `${origin}/og-image.svg?t=${encodeURIComponent(title)}&l=${lang}`;

    // isHome: true when visiting language root (ar='/', en='/en/', fr='/fr/', ...)
    const isHome = (corePath === '/');

    return {
        title, description, canonical, arUrl, enUrl, frUrl, trUrl, urUrl, deUrl, idUrl, esUrl, bnUrl, msUrl,
        isEn, isRtl, lang, siteName, isHome,
        ogType, ogImageUrl, breadcrumbs, geo, prev, next, article,
        webApp, qiblaRef, countryListing, cityModified, origin
    };
}

/**
 * يبني كتلة HTML لحقنها داخل <head> قبل </head>.
 * تشمل: robots, canonical, hreflang×3, OG×8+, Twitter×3, BreadcrumbList, geo, prev/next, article:*.
 */
function renderSeoHeadHtml(seo) {
    const esc = _escHtml;
    const parts = [];
    parts.push('<!-- SSR-SEO-START -->');
    parts.push(`<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">`);
    // NOTE: لا نضيف preconnect لـ nominatim — جميع طلبات الـ geocoding تمرّ عبر proxy محلي (/api/geocode)
    parts.push(`<link rel="canonical" href="${esc(seo.canonical)}">`);
    parts.push(`<link rel="alternate" hreflang="ar" href="${esc(seo.arUrl)}">`);
    parts.push(`<link rel="alternate" hreflang="en" href="${esc(seo.enUrl)}">`);
    if (seo.frUrl) parts.push(`<link rel="alternate" hreflang="fr" href="${esc(seo.frUrl)}">`);
    if (seo.trUrl) parts.push(`<link rel="alternate" hreflang="tr" href="${esc(seo.trUrl)}">`);
    if (seo.urUrl) parts.push(`<link rel="alternate" hreflang="ur" href="${esc(seo.urUrl)}">`);
    if (seo.deUrl) parts.push(`<link rel="alternate" hreflang="de" href="${esc(seo.deUrl)}">`);
    if (seo.idUrl) parts.push(`<link rel="alternate" hreflang="id" href="${esc(seo.idUrl)}">`);
    if (seo.esUrl) parts.push(`<link rel="alternate" hreflang="es" href="${esc(seo.esUrl)}">`);
    if (seo.bnUrl) parts.push(`<link rel="alternate" hreflang="bn" href="${esc(seo.bnUrl)}">`);
    if (seo.msUrl) parts.push(`<link rel="alternate" hreflang="ms" href="${esc(seo.msUrl)}">`);
    parts.push(`<link rel="alternate" hreflang="x-default" href="${esc(seo.arUrl)}">`);
    // ضمان self-referential hreflang: إذا لم يكن URL اللغة الحالية = canonical (خلل build)،
    // أضف alternate إضافي يشير للـ canonical (SEO best practice: كل صفحة يجب أن ترى نفسها في hreflang).
    const _currentLangUrl = { ar: seo.arUrl, en: seo.enUrl, fr: seo.frUrl, tr: seo.trUrl, ur: seo.urUrl, de: seo.deUrl, id: seo.idUrl, es: seo.esUrl, bn: seo.bnUrl, ms: seo.msUrl }[seo.lang];
    if (_currentLangUrl && _currentLangUrl !== seo.canonical) {
        parts.push(`<link rel="alternate" hreflang="${seo.lang}" href="${esc(seo.canonical)}">`);
    }
    // OpenGraph
    parts.push(`<meta property="og:title" content="${esc(seo.title)}">`);
    parts.push(`<meta property="og:description" content="${esc(seo.description)}">`);
    parts.push(`<meta property="og:url" content="${esc(seo.canonical)}">`);
    parts.push(`<meta property="og:type" content="${esc(seo.ogType)}">`);
    parts.push(`<meta property="og:site_name" content="${esc(seo.siteName)}">`);
    const LOCALE_MAP = { ar: 'ar_SA', en: 'en_US', fr: 'fr_FR', tr: 'tr_TR', ur: 'ur_PK', de: 'de_DE', id: 'id_ID', es: 'es_ES', bn: 'bn_BD', ms: 'ms_MY' };
    const _locale = LOCALE_MAP[seo.lang] || 'ar_SA';
    parts.push(`<meta property="og:locale" content="${_locale}">`);
    for (const [_l, _v] of Object.entries(LOCALE_MAP)) {
        if (_l !== seo.lang) parts.push(`<meta property="og:locale:alternate" content="${_v}">`);
    }
    parts.push(`<meta property="og:image" content="${esc(seo.ogImageUrl)}">`);
    parts.push(`<meta property="og:image:width" content="1200">`);
    parts.push(`<meta property="og:image:height" content="630">`);
    parts.push(`<meta property="og:image:alt" content="${esc(seo.title)}">`);
    // Twitter
    parts.push(`<meta name="twitter:card" content="summary_large_image">`);
    parts.push(`<meta name="twitter:title" content="${esc(seo.title)}">`);
    parts.push(`<meta name="twitter:description" content="${esc(seo.description)}">`);
    parts.push(`<meta name="twitter:image" content="${esc(seo.ogImageUrl)}">`);
    // Geo (for city pages)
    if (seo.geo) {
        parts.push(`<meta name="geo.position" content="${seo.geo.lat};${seo.geo.lng}">`);
        parts.push(`<meta name="ICBM" content="${seo.geo.lat}, ${seo.geo.lng}">`);
    }
    // prev/next
    if (seo.prev) parts.push(`<link rel="prev" href="${esc(seo.prev)}">`);
    if (seo.next) parts.push(`<link rel="next" href="${esc(seo.next)}">`);
    // Article meta (+ dateModified for city pages)
    if (seo.article) {
        parts.push(`<meta property="article:published_time" content="${esc(seo.article.published)}">`);
        parts.push(`<meta property="article:modified_time" content="${esc(seo.article.modified)}">`);
        parts.push(`<meta property="article:author" content="${esc(seo.siteName)}">`);
    } else if (seo.cityModified) {
        parts.push(`<meta property="article:modified_time" content="${esc(seo.cityModified)}">`);
    }

    // ===== Unified @graph SEO Schema =====
    // يجمع: Organization (logo + sameAs), ImageObject (OG), BreadcrumbList,
    // WebApplication (لصفحات الأدوات), Place (للقبلة مع الكعبة)
    const ssrGraph = [];
    const orgId   = `${seo.origin}/#organization`;
    const logoId  = `${seo.origin}/#logo`;
    const imageId = `${seo.ogImageUrl}#image`;

    // Organization with logo
    ssrGraph.push({
        "@type": "Organization",
        "@id": orgId,
        "name": seo.siteName,
        "alternateName": "Prayer Times & Hijri Calendar",
        "url": seo.origin + '/',
        "logo": { "@id": logoId },
        "description": seo.description
        // "sameAs": [...social profiles — to add when accounts ready...]
    });

    // WebSite + SearchAction (sitelinks search box في SERP)
    // فقط مرّة واحدة لكل site، نحقنها على الصفحة الرئيسية لكل لغة
    if (seo.isHome) {
        ssrGraph.push({
            "@type": "WebSite",
            "@id": `${seo.origin}/#website`,
            "url": seo.origin + '/',
            "name": seo.siteName,
            "description": seo.description,
            "inLanguage": seo.lang,
            "publisher": { "@id": orgId },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${seo.origin}/prayer-times-in-{search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        });
    }

    // Organization logo — ImageObject
    ssrGraph.push({
        "@type": "ImageObject",
        "@id": logoId,
        "url": `${seo.origin}/og-image.svg`,
        "contentUrl": `${seo.origin}/og-image.svg`,
        "width": 1200,
        "height": 630,
        "caption": seo.siteName
    });

    // Primary OG image — standalone ImageObject
    ssrGraph.push({
        "@type": "ImageObject",
        "@id": imageId,
        "url": seo.ogImageUrl,
        "contentUrl": seo.ogImageUrl,
        "width": 1200,
        "height": 630,
        "caption": seo.title,
        "representativeOfPage": true
    });

    // BreadcrumbList (if >= 2 items)
    if (seo.breadcrumbs && seo.breadcrumbs.length >= 2) {
        ssrGraph.push({
            "@type": "BreadcrumbList",
            "@id": `${seo.canonical}#breadcrumb`,
            "itemListElement": seo.breadcrumbs.map((b, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": b.name,
                "item": b.item
            }))
        });
    }

    // WebApplication for tool pages
    if (seo.webApp) {
        ssrGraph.push({
            "@type": "WebApplication",
            "@id": `${seo.canonical}#webapp`,
            "name": seo.webApp.name,
            "url": seo.webApp.url,
            "description": seo.description,
            "applicationCategory": seo.webApp.category,
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript. Requires HTML5.",
            "inLanguage": seo.lang,
            "isAccessibleForFree": true,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "publisher": { "@id": orgId },
            "image": { "@id": imageId }
        });
    }

    // Place with Kaaba reference — for /qibla-in-*
    if (seo.qiblaRef) {
        ssrGraph.push({
            "@type": "Place",
            "@id": `${seo.canonical}#place-origin`,
            "name": seo.qiblaRef.cityName,
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": seo.qiblaRef.lat,
                "longitude": seo.qiblaRef.lng
            }
        });
        ssrGraph.push({
            "@type": "Place",
            "@id": "https://www.google.com/maps?q=21.4225,39.8262#kaaba",
            "name": seo.isEn ? 'The Kaaba' : 'الكعبة المشرفة',
            "alternateName": seo.isEn ? 'Al-Masjid al-Haram' : 'المسجد الحرام',
            "address": {
                "@type": "PostalAddress",
                "addressLocality": seo.isEn ? 'Mecca' : 'مكة المكرمة',
                "addressCountry": seo.isEn ? 'Saudi Arabia' : 'المملكة العربية السعودية'
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 21.4225,
                "longitude": 39.8262
            }
        });
    }

    // FAQPage — للصفحة الرئيسية فقط (rich results)
    if (seo.isHome) {
        const FAQ_I18N = {
            ar: [
                { q: 'كيف تُحسَب مواقيت الصلاة في هذا الموقع؟',
                  a: 'يعتمد الموقع على طرق حساب فلكية معترف بها دولياً مثل رابطة العالم الإسلامي، أم القرى، الهيئة المصرية العامة للمساحة، وجامعة العلوم الإسلامية في كراتشي. يمكنك اختيار الطريقة المناسبة لمنطقتك من الإعدادات.' },
                { q: 'هل مواقيت الصلاة دقيقة؟',
                  a: 'نعم، تُحسَب المواقيت لحظياً بناءً على الإحداثيات الجغرافية (خط العرض والطول) والتوقيت المحلي والطريقة الحسابية المختارة، وتُطابق المواقع الرسمية للمدن الرئيسية.' },
                { q: 'كيف أعرف اتجاه القبلة من موقعي؟',
                  a: 'استخدم صفحة "اتجاه القبلة" — بعد السماح بالوصول لموقعك، ستُحدَّد درجة اتجاه الكعبة المشرفة من مكانك الحالي على بوصلة تفاعلية وخريطة.' },
                { q: 'هل يدعم الموقع التقويم الهجري وتحويل التواريخ؟',
                  a: 'نعم، يعتمد الموقع تقويم أم القرى الرسمي ويدعم تحويل التاريخ من الهجري إلى الميلادي والعكس من سنة 1 هـ إلى 1500 هـ.' },
                { q: 'هل الموقع مجاني بالكامل؟',
                  a: 'نعم، جميع الميزات مجانية: مواقيت الصلاة، القبلة، حاسبة الزكاة، الأدعية والأذكار، المسبحة الإلكترونية، والتقويم الهجري — بدون إعلانات تدخّلية ولا تسجيل.' }
            ],
            en: [
                { q: 'How are prayer times calculated on this site?',
                  a: 'We use internationally recognized calculation methods: Muslim World League, Umm al-Qura, Egyptian General Authority of Survey, University of Islamic Sciences Karachi, and more. You can pick the method matching your region from Settings.' },
                { q: 'Are the prayer times accurate?',
                  a: 'Yes. Times are computed in real-time from your geographic coordinates (lat/lng), local timezone, and the selected calculation method — matching official sources for major cities.' },
                { q: 'How can I find the Qibla direction from my location?',
                  a: 'Open the "Qibla" page — after allowing location access, we calculate the exact bearing to the Kaaba in Mecca and display it on an interactive compass and map.' },
                { q: 'Does the site support the Hijri calendar and date conversion?',
                  a: "Yes. We use the official Umm al-Qura calendar and support converting dates between Hijri and Gregorian for years 1–1500 AH." },
                { q: 'Is the site completely free?',
                  a: 'Yes. All features — prayer times, Qibla, Zakat calculator, duas & adhkar, digital tasbih, Hijri calendar — are free, with no intrusive ads and no signup required.' }
            ],
            fr: [
                { q: 'Comment les heures de prière sont-elles calculées ?',
                  a: "Nous utilisons des méthodes de calcul reconnues : Ligue Islamique Mondiale, Umm al-Qura, Autorité Égyptienne de Topographie, Université des Sciences Islamiques de Karachi, etc. Choisissez la méthode adaptée à votre région dans les paramètres." },
                { q: 'Les heures de prière sont-elles précises ?',
                  a: "Oui. Les heures sont calculées en temps réel à partir de vos coordonnées géographiques, du fuseau horaire local et de la méthode choisie — conformes aux sources officielles des grandes villes." },
                { q: 'Comment trouver la direction de la Qibla depuis ma position ?',
                  a: "Ouvrez la page « Qibla » — après autorisation de localisation, nous calculons le cap exact vers la Kaaba à La Mecque et l'affichons sur une boussole interactive." },
                { q: 'Le site prend-il en charge le calendrier hégirien ?',
                  a: "Oui. Nous utilisons le calendrier officiel Umm al-Qura et permettons la conversion entre dates hégiriennes et grégoriennes de l'an 1 à 1500 AH." },
                { q: 'Le site est-il entièrement gratuit ?',
                  a: "Oui. Toutes les fonctionnalités sont gratuites, sans publicités intrusives ni inscription requise." }
            ],
            tr: [
                { q: 'Namaz vakitleri bu sitede nasıl hesaplanıyor?',
                  a: "Uluslararası kabul görmüş hesaplama yöntemleri kullanıyoruz: Müslüman Dünya Birliği, Ümmü'l-Kura, Mısır Genel Topografya Kurumu, Karaçi İslami İlimler Üniversitesi. Bölgenize uygun yöntemi Ayarlar'dan seçebilirsiniz." },
                { q: 'Namaz vakitleri doğru mu?',
                  a: 'Evet. Vakitler, coğrafi koordinatlarınız, yerel saat diliminiz ve seçtiğiniz hesaplama yöntemine göre anlık olarak hesaplanır ve büyük şehirler için resmi kaynaklarla eşleşir.' },
                { q: 'Konumumdan kıble yönünü nasıl bulabilirim?',
                  a: '"Kıble" sayfasını açın — konum izni verdikten sonra Mekke\'deki Kâbe\'ye doğru tam yön açısını hesaplıyor ve etkileşimli pusulada gösteriyoruz.' },
                { q: 'Site hicri takvimi ve tarih dönüştürmeyi destekliyor mu?',
                  a: "Evet. Resmi Ümmü'l-Kura takvimini kullanıyor ve 1–1500 hicri yılları arası Hicri↔Miladi tarih dönüştürmeyi destekliyoruz." },
                { q: 'Site tamamen ücretsiz mi?',
                  a: 'Evet. Tüm özellikler — namaz vakitleri, kıble, zekât hesaplayıcı, dualar, tesbih, hicri takvim — rahatsız edici reklamlar ve üyelik gerektirmeden ücretsizdir.' }
            ],
            ur: [
                { q: 'اس سائٹ پر اوقاتِ نماز کیسے حساب کیے جاتے ہیں؟',
                  a: 'ہم بین الاقوامی طور پر تسلیم شدہ طریقے استعمال کرتے ہیں: مسلم ورلڈ لیگ، ام القریٰ، مصری جنرل اتھارٹی آف سروے، جامعہ علومِ اسلامیہ کراچی۔ آپ اپنے علاقے کے لیے مناسب طریقہ سیٹنگز سے منتخب کر سکتے ہیں۔' },
                { q: 'کیا اوقاتِ نماز درست ہیں؟',
                  a: 'جی ہاں۔ اوقات آپ کے جغرافیائی کوآرڈینیٹس، مقامی ٹائم زون اور منتخب طریقے کی بنیاد پر ریئل ٹائم میں حساب کیے جاتے ہیں اور بڑے شہروں کے سرکاری ذرائع سے مطابقت رکھتے ہیں۔' },
                { q: 'میں اپنے مقام سے قبلہ کی سمت کیسے معلوم کروں؟',
                  a: '"قبلہ" صفحہ کھولیں — مقام کی اجازت دینے کے بعد ہم آپ کی جگہ سے مکہ میں کعبہ کی طرف درست زاویہ حساب کرتے ہیں اور انٹرایکٹو کمپاس پر دکھاتے ہیں۔' },
                { q: 'کیا سائٹ ہجری کیلنڈر اور تاریخ کنورٹ کرنے کو سپورٹ کرتی ہے؟',
                  a: 'جی ہاں۔ ہم سرکاری ام القریٰ کیلنڈر استعمال کرتے ہیں اور 1 تا 1500 ہجری سال کے لیے ہجری↔عیسوی تاریخ کنورژن سپورٹ کرتے ہیں۔' },
                { q: 'کیا سائٹ مکمل طور پر مفت ہے؟',
                  a: 'جی ہاں۔ تمام خصوصیات — اوقاتِ نماز، قبلہ، زکاۃ کیلکولیٹر، دعائیں، تسبیح، ہجری کیلنڈر — بلا کسی مداخلت کار اشتہار یا سائن اپ کے مفت ہیں۔' }
            ],
        };
        const faqs = FAQ_I18N[seo.lang] || FAQ_I18N.ar;
        ssrGraph.push({
            "@type": "FAQPage",
            "@id": `${seo.canonical}#faq`,
            "inLanguage": seo.lang,
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
        });
    }

    // Place (country) for country listing pages — /{country-slug}
    if (seo.countryListing) {
        ssrGraph.push({
            "@type": "Place",
            "@id": `${seo.canonical}#country`,
            "name": seo.countryListing.name,
            "description": seo.description,
            "url": seo.canonical,
            "additionalType": "https://schema.org/Country"
        });
    }

    if (ssrGraph.length) {
        const graphSchema = { "@context": "https://schema.org", "@graph": ssrGraph };
        parts.push(`<script id="ssr-graph-schema" type="application/ld+json">${JSON.stringify(graphSchema)}</script>`);
    }
    parts.push('<!-- SSR-SEO-END -->');
    return parts.map(x => '    ' + x).join('\n');
}

/**
 * الدالة الموحّدة لتقديم HTML مع حقن SEO كامل.
 * تستبدل جميع الكتل المكررة (readCachedFile → gzip → res.end).
 */
function serveHtmlWithSeo(htmlBuf, urlPath, res, acceptEnc) {
    let html = htmlBuf.toString('utf8');
    const seo = buildSeoForPath(urlPath);

    // 0) استبدال {LANG_PREFIX} بالبادئة الحاليّة (يخدم روابط الفوتر القانونيّة وغيرها)
    const _lpFor = (seo.lang === 'ar') ? '' : '/' + seo.lang;
    if (html.indexOf('{LANG_PREFIX}') !== -1) {
        html = html.split('{LANG_PREFIX}').join(_lpFor);
    }

    // 1) Language swap (ar → lang) لمنع CLS + دعم RTL للأردو والعربية
    if (seo.lang !== 'ar') {
        const newDir = seo.isRtl ? 'rtl' : 'ltr';
        html = html.replace(/<html([^>]*)\blang="ar"([^>]*)\bdir="rtl"/, `<html$1lang="${seo.lang}"$2dir="${newDir}"`);
    }
    // 2) base href لحل المسارات النسبية تحت /en/... أو /hijri-calendar/...
    if (!html.includes('<base ')) {
        html = html.replace('<head>', '<head>\n    <base href="/">');
    }
    // 3) استبدال <title> و <meta name="description"> الموجودين
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${_escHtml(seo.title)}</title>`);
    html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
                        `<meta name="description" content="${_escHtml(seo.description)}">`);
    // 4) حقن كتلة SEO قبل </head>
    const seoBlock = renderSeoHeadHtml(seo);
    html = html.replace('</head>', `${seoBlock}\n</head>`);

    // 4.5) Inline CSS → يُزيل render-blocking request (توفير ~400ms على LCP)
    if (_inlineCssText) {
        html = html.replace(
            /<link\s+rel="stylesheet"\s+href="css\/style\.css\?v=\d+"\s*\/?>/i,
            `<style>${_inlineCssText}</style>`
        );
    }

    // 5) SSR نص #seo-line-1 و #seo-line-2 لصفحات المدن (LCP fix: -3.5s render delay)
    //    JS يستبدلها لاحقاً بالأوقات الفعلية. هذا placeholder ثابت يُقدَّم في HTML الأولي.
    const cityMatchSsr = urlPath.replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\//, '/')
                                .replace(/\.html$/, '')
                                .match(/^\/prayer-times-in-([a-z0-9-]+?)(?:-(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?))?$/);

    // 5a) SSR لـ H1 — الـ crawler يرى H1 دلالياً قبل تنفيذ JS (يحلّ H1='--' placeholder)
    {
        const Lh = seo.lang;
        let _h1Text;
        if (seo.countryListing) {
            // صفحة قائمة مدن دولة: H1 خاصّ بالدولة (يستبدل city/home H1 لجميع اللغات)
            const cn = seo.countryListing.name;
            _h1Text = {
                ar: `مواقيت الصلاة في مدن ${cn}`,
                en: `Prayer Times in Cities of ${cn}`,
                fr: `Heures de prière dans les villes de ${cn}`,
                tr: `${cn} Şehirlerinde Namaz Vakitleri`,
                ur: `${cn} کے شہروں میں اوقاتِ نماز`,
                de: `Gebetszeiten in den Städten von ${cn}`,
                id: `Jadwal Sholat di Kota-Kota ${cn}`,
                es: `Horarios de Oración en Ciudades de ${cn}`,
                bn: `${cn}-এর শহরগুলোতে নামাজের সময়`,
                ms: `Waktu Solat di Bandar-Bandar ${cn}`,
            }[Lh] || `Prayer Times in Cities of ${cn}`;
        } else if (cityMatchSsr) {
            const cityDisplay = _slugToTitle(cityMatchSsr[1]);
            _h1Text = {
                ar: `مواقيت الصلاة في ${cityDisplay} اليوم`,
                en: `Prayer Times in ${cityDisplay} Today`,
                fr: `Heures de prière à ${cityDisplay} aujourd'hui`,
                tr: `${cityDisplay} için bugünkü namaz vakitleri`,
                ur: `آج ${cityDisplay} میں اوقاتِ نماز`,
                de: `Gebetszeiten in ${cityDisplay} heute`,
                id: `Jadwal Sholat di ${cityDisplay} Hari Ini`,
                es: `Horarios de Oración en ${cityDisplay} Hoy`,
                bn: `আজ ${cityDisplay}-এ নামাজের সময়`,
                ms: `Waktu Solat di ${cityDisplay} Hari Ini`,
            }[Lh] || `Prayer times in ${cityDisplay}`;
        } else {
            // Homepage H1 — يحوي keyword "اليوم" (Keyword Consistency Round 7e)
            _h1Text = {
                ar: 'مواقيت الصلاة اليوم والتاريخ الهجري',
                en: "Today's Prayer Times and Hijri Calendar",
                fr: "Heures de prière aujourd'hui et calendrier Hégirien",
                tr: 'Bugünkü Namaz Vakitleri ve Hicri Takvim',
                ur: 'آج اوقاتِ نماز اور ہجری کیلنڈر',
                de: 'Heutige Gebetszeiten und Hidschri-Kalender',
                id: 'Jadwal Sholat Hari Ini dan Kalender Hijriyah',
                es: 'Horarios de Oración Hoy y Calendario Hijri',
                bn: 'আজকের নামাজের সময় ও হিজরি ক্যালেন্ডার',
                ms: 'Waktu Solat Hari Ini dan Kalendar Hijrah',
            }[Lh] || "Today's Prayer Times and Hijri Calendar";
        }
        html = html.replace(
            /<h1 class="page-h1" id="page-h1">[^<]*<\/h1>/,
            `<h1 class="page-h1" id="page-h1">${_escHtml(_h1Text)}</h1>`
        );
    }

    if (seo.countryListing) {
        // ── صفحة قائمة مدن دولة ── (6 لغات) — تمنع city-style SSR على URLs مثل /prayer-times-in-germany
        const cn = seo.countryListing.name;
        const L = seo.lang;
        // SSR للعنوان الرئيسي لـ prayer-times-cities.html (id="page-title" — مكتوب بالعربية في القالب)
        const _countryH1 = {
            ar: `مواقيت الصلاة في مدن ${cn}`,
            en: `Prayer Times in Cities of ${cn}`,
            fr: `Heures de prière dans les villes de ${cn}`,
            tr: `${cn} Şehirlerinde Namaz Vakitleri`,
            ur: `${cn} کے شہروں میں اوقاتِ نماز`,
            de: `Gebetszeiten in den Städten von ${cn}`,
            id: `Jadwal Sholat di Kota-Kota ${cn}`,
            es: `Horarios de Oración en Ciudades de ${cn}`,
            bn: `${cn}-এর শহরগুলোতে নামাজের সময়`,
            ms: `Waktu Solat di Bandar-Bandar ${cn}`,
        }[L] || `Prayer Times in Cities of ${cn}`;
        html = html.replace(
            /<h1([^>]*)id="page-title"([^>]*)>[^<]*<\/h1>/,
            `<h1$1id="page-title"$2>${_escHtml(_countryH1)}</h1>`
        );
        // SSR لـ breadcrumb الأخير (id="cbc-country") — اسم الدولة المترجَم بدل "--"
        html = html.replace(
            '<li class="bc-item bc-current" id="cbc-country" aria-current="page">--</li>',
            `<li class="bc-item bc-current" id="cbc-country" aria-current="page">${_escHtml(cn)}</li>`
        );
        const line1 = {
            ar: `مواقيت الصلاة في مدن ${cn} — تصفّح الجدول اليومي.`,
            en: `Prayer times across cities of ${cn} — browse today's schedule.`,
            fr: `Heures de prière dans les villes de ${cn} — consultez le programme du jour.`,
            tr: `${cn} şehirlerinde namaz vakitleri — bugünkü programa göz atın.`,
            ur: `${cn} کے شہروں میں اوقاتِ نماز — آج کا جدول دیکھیں۔`,
            de: `Gebetszeiten in den Städten von ${cn} — heute den Plan durchsuchen.`,
            id: `Jadwal sholat di kota-kota ${cn} — lihat jadwal hari ini.`,
            es: `Horarios de oración en las ciudades de ${cn} — consulte el horario de hoy.`,
            bn: `${cn}-এর শহরগুলোতে নামাজের সময় — আজকের সময়সূচী দেখুন।`,
            ms: `Waktu solat di bandar-bandar ${cn} — lihat jadual hari ini.`,
        }[L] || `Prayer times across cities of ${cn}.`;
        const line2 = {
            ar: `اختر مدينتك في ${cn} لعرض مواقيت الصلاة اليوم: الفجر، الظهر، العصر، المغرب، العشاء.`,
            en: `Pick your city in ${cn} to view today's prayer times: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            fr: `Choisissez votre ville en ${cn} pour voir les heures de prière du jour : Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            tr: `${cn} içinde şehrinizi seçerek bugünkü namaz vakitlerini görüntüleyin: Fecir, Öğle, İkindi, Akşam, Yatsı.`,
            ur: `${cn} میں اپنا شہر منتخب کریں تاکہ آج کے اوقاتِ نماز دیکھیں: فجر، ظہر، عصر، مغرب، عشاء۔`,
            de: `Wählen Sie Ihre Stadt in ${cn} aus, um die heutigen Gebetszeiten anzuzeigen: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            id: `Pilih kota Anda di ${cn} untuk melihat jadwal sholat hari ini: Subuh, Zuhur, Asar, Magrib, Isya.`,
            es: `Elija su ciudad en ${cn} para ver los horarios de oración de hoy: Fayr, Dhuhr, Asr, Magrib, Isha.`,
            bn: `${cn}-এ আপনার শহর নির্বাচন করুন আজকের নামাজের সময় দেখতে: ফজর, জোহর, আসর, মাগরিব, এশা।`,
            ms: `Pilih bandar anda di ${cn} untuk melihat waktu solat hari ini: Subuh, Zohor, Asar, Maghrib, Isyak.`,
        }[L] || `Pick your city in ${cn}.`;
        html = html.replace(
            '<p class="seo-line" id="seo-line-1"></p>',
            `<p class="seo-line" id="seo-line-1">${_escHtml(line1)}</p>`
        );
        html = html.replace(
            '<p class="seo-line" id="seo-line-2"></p>',
            `<p class="seo-line" id="seo-line-2">${_escHtml(line2)}</p>`
        );
        // banner-city-name → اسم الدولة المترجَم (مثلاً "Deutschland" بدل "--")
        html = html.replace(
            '<span id="banner-city-name">--</span>',
            `<span id="banner-city-name">${_escHtml(cn)}</span>`
        );
        // breadcrumb الأخير → اسم الدولة فقط (ليس "مواقيت الصلاة في ...")
        html = html.replace(
            '<span id="bc-city" aria-current="page">--</span>',
            `<span id="bc-city" aria-current="page">${_escHtml(cn)}</span>`
        );
        try {
            const localeMap = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
            const gregDate = new Date().toLocaleDateString(
                localeMap[L] || 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
            );
            html = html.replace(
                '<div class="banner-date-greg" id="banner-greg-date">--</div>',
                `<div class="banner-date-greg" id="banner-greg-date">${_escHtml(gregDate)}</div>`
            );
        } catch(e) { /* noop */ }
    } else if (cityMatchSsr) {
        const cityDisplay = _slugToTitle(cityMatchSsr[1]);
        const L = seo.lang;
        const line1 = {
            ar: `مواقيت الصلاة في ${cityDisplay} — الجدول اليومي.`,
            en: `Prayer times in ${cityDisplay} — today's schedule.`,
            fr: `Heures de prière à ${cityDisplay} — horaire du jour.`,
            tr: `${cityDisplay} için namaz vakitleri — bugünkü program.`,
            ur: `${cityDisplay} میں اوقاتِ نماز — آج کا جدول۔`,
            de: `Gebetszeiten in ${cityDisplay} — der heutige Plan.`,
            id: `Jadwal sholat di ${cityDisplay} — jadwal hari ini.`,
        }[L] || `Prayer times in ${cityDisplay}.`;
        const line2 = {
            ar: `أوقات الصلاة اليوم في ${cityDisplay}: الفجر، الظهر، العصر، المغرب، العشاء.`,
            en: `Today's prayer times in ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            fr: `Heures de prière aujourd'hui à ${cityDisplay} : Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            tr: `Bugün ${cityDisplay} için namaz vakitleri: Fecir, Öğle, İkindi, Akşam, Yatsı.`,
            ur: `آج ${cityDisplay} میں اوقاتِ نماز: فجر، ظہر، عصر، مغرب، عشاء۔`,
            de: `Heutige Gebetszeiten in ${cityDisplay}: Fajr, Dhuhr, Asr, Maghrib, Isha.`,
            id: `Jadwal sholat hari ini di ${cityDisplay}: Subuh, Zuhur, Asar, Magrib, Isya.`,
        }[L] || `Today's prayer times in ${cityDisplay}.`;
        html = html.replace(
            '<p class="seo-line" id="seo-line-1"></p>',
            `<p class="seo-line" id="seo-line-1">${_escHtml(line1)}</p>`
        );
        html = html.replace(
            '<p class="seo-line" id="seo-line-2"></p>',
            `<p class="seo-line" id="seo-line-2">${_escHtml(line2)}</p>`
        );

        // SSR نصوص البانر المعروفة → يُزيل CLS الناتج عن استبدال "--" بالنصوص client-side.
        // JS يُحدِّث التاريخ الميلادي لاحقاً حسب timezone المدينة.
        html = html.replace(
            '<span id="banner-city-name">--</span>',
            `<span id="banner-city-name">${_escHtml(cityDisplay)}</span>`
        );
        // SSR للـ breadcrumb الأخير المدمج "مواقيت الصلاة في {city}" (3-item hierarchy)
        const _ssrFinal = ({
            ar: `مواقيت الصلاة في ${cityDisplay}`,
            en: `Prayer Times in ${cityDisplay}`,
            fr: `Heures de prière à ${cityDisplay}`,
            tr: `${cityDisplay} Namaz Vakitleri`,
            ur: `${cityDisplay} میں اوقاتِ نماز`,
            de: `Gebetszeiten in ${cityDisplay}`,
            id: `Jadwal Sholat di ${cityDisplay}`,
        })[L] || `Prayer Times in ${cityDisplay}`;
        html = html.replace(
            '<span id="bc-city" aria-current="page">--</span>',
            `<span id="bc-city" aria-current="page">${_escHtml(_ssrFinal)}</span>`
        );
        try {
            const localeMap = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
            const gregDate = new Date().toLocaleDateString(
                localeMap[L] || 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
            );
            html = html.replace(
                '<div class="banner-date-greg" id="banner-greg-date">--</div>',
                `<div class="banner-date-greg" id="banner-greg-date">${_escHtml(gregDate)}</div>`
            );
        } catch(e) { /* toLocaleDateString fallback — تبقى "--" */ }
    } else {
        // 5b) SSR للصفحة الرئيسية (و URLs أخرى غير city): فقرات SEO حقيقية بدل الفارغة
        //     يُزيل "Content thin" warning ويضيف keywords في HTML الأوّلي.
        const Lh = seo.lang;
        // Round 7e: إضافة keywords ديناميكية (شوال 1447، أبريل 2026، مكة المكرمة، الصلاة في)
        const _hN = _hijriNow();
        const _hmSlug = _HIJRI_MONTHS_BY_ORDER[_hN.month];
        const _hMAr = (_HIJRI_MONTHS[_hmSlug] || {}).ar || '';
        const _hMEn = (_HIJRI_MONTHS[_hmSlug] || {}).en || '';
        const _hY = _hN.year;
        const _gNow2 = new Date();
        const _gMIdx = _gNow2.getMonth();
        const _gY2 = _gNow2.getFullYear();
        const _gMAr = _GREG_MONTHS.ar[_gMIdx];
        const _gMEn = _GREG_MONTHS.en[_gMIdx];
        const _gMFr = _GREG_MONTHS.fr[_gMIdx];
        const _gMTr = _GREG_MONTHS.tr[_gMIdx];
        const _gMUr = _GREG_MONTHS.ur[_gMIdx];
        const _gMDe = _GREG_MONTHS.de[_gMIdx];
        const _gMId = _GREG_MONTHS.id[_gMIdx];
        // نصوص مقسَّمة لجمل قصيرة (~15-20 كلمة لكل جملة) + تحوي كلمات H1 (لكل/مدن/العالم/التاريخ الهجري)
        // NOTE: كل فقرة تبدأ بالعبارة الكاملة للـ H1 "مواقيت الصلاة والتاريخ الهجري"
        //       (exact phrase match) لإزالة warning "H1 keywords not in text".
        const homeL1 = {
            ar: `مواقيت الصلاة والتاريخ الهجري في متناول يدك — احسب مواقيت الصلاة في مكة المكرمة والمدينة المنوّرة وكل مدن العالم اليوم (الفجر، الشروق، الظهر، العصر، المغرب، العشاء). التقويم الهجري لشهر ${_hMAr} ${_hY} هـ الموافق ${_gMAr} ${_gY2} م، بطرق حساب موثوقة: رابطة العالم الإسلامي، أم القرى، الهيئة المصرية العامة وغيرها.`,
            en: `Prayer Times and Hijri Calendar at your fingertips — calculate today prayer times in Mecca, Medina and every city worldwide (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha). Hijri calendar for ${_hMEn} ${_hY} AH corresponding to ${_gMEn} ${_gY2}, using trusted methods: Muslim World League, Umm al-Qura, Egyptian Authority and more.`,
            fr: `Heures de prière et calendrier Hégirien à portée de main — calculez aujourd'hui les heures de prière à La Mecque, Médine et dans toutes les villes du monde (Fajr, Dhuhr, Asr, Maghrib, Isha). Calendrier hégirien de ${_hMEn} ${_hY} correspondant à ${_gMFr} ${_gY2}, avec des méthodes fiables : Ligue Islamique Mondiale, Umm al-Qura.`,
            tr: `Namaz Vakitleri ve Hicri Takvim parmaklarınızın ucunda — bugün Mekke, Medine ve dünyanın her şehri için namaz vakitlerini (Fecir, Öğle, İkindi, Akşam, Yatsı) hesaplayın. ${_hMEn} ${_hY} / ${_gMTr} ${_gY2} için Hicri takvim; güvenilir yöntemler: Müslüman Dünya Birliği, Ümmü'l-Kura.`,
            ur: `اوقاتِ نماز اور ہجری کیلنڈر آپ کی انگلیوں پر — آج مکہ مکرمہ، مدینہ منوّرہ اور دنیا کے ہر شہر کے لیے اوقاتِ نماز (فجر، ظہر، عصر، مغرب، عشاء) حساب کریں۔ ${_hMEn} ${_hY} / ${_gMUr} ${_gY2} کا ہجری کیلنڈر؛ قابلِ اعتماد طریقے: مسلم ورلڈ لیگ، ام القریٰ۔`,
            de: `Gebetszeiten und Hidschri-Kalender immer griffbereit — berechnen Sie die heutigen Gebetszeiten in Mekka, Medina und jeder Stadt weltweit (Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib, Isha). Hidschri-Kalender für ${_hMEn} ${_hY} AH entspricht ${_gMDe} ${_gY2}, mit zuverlässigen Berechnungsmethoden: Muslimische Weltliga, Umm al-Qura, Ägyptische Generalbehörde und weitere.`,
            id: `Jadwal Sholat dan Kalender Hijriyah dalam genggaman Anda — hitung jadwal sholat hari ini di Mekah, Madinah, dan setiap kota di dunia (Subuh, Terbit, Zuhur, Asar, Magrib, Isya). Kalender Hijriyah untuk ${_hMEn} ${_hY} H yang bertepatan dengan ${_gMId} ${_gY2}, dengan metode perhitungan terpercaya: Liga Dunia Muslim, Umm al-Qura, Otoritas Umum Mesir, dan lainnya.`,
        }[Lh] || '';
        const homeL2 = {
            ar: `مواقيت الصلاة والتاريخ الهجري اليوم — ${_hMAr} ${_hY} هـ — مع تحويل التاريخ بين الهجري والميلادي، اتجاه القبلة نحو الكعبة المشرفة في مكة المكرمة، حاسبة الزكاة، الأدعية والأذكار الصحيحة من الكتاب والسنة، والمسبحة الإلكترونية — تطبيق واحد لكل احتياجات المسلم اليومية.`,
            en: `Prayer Times and Hijri Calendar today — ${_hMEn} ${_hY} AH — with Hijri-Gregorian date conversion, Qibla direction to the Kaaba in Mecca, Zakat calculator, authentic duas and adhkar from Quran and Sunnah, and a digital tasbih — one application for every daily Muslim need.`,
            fr: `Heures de prière et calendrier Hégirien d'aujourd'hui — ${_hMEn} ${_hY} — avec conversion Hégirien-Grégorien, direction de la Qibla vers la Kaaba à La Mecque, calculateur de Zakat, douas et adhkar authentiques, et un tasbih numérique — une seule application pour tous les besoins quotidiens.`,
            tr: `Bugün için Namaz Vakitleri ve Hicri Takvim — ${_hMEn} ${_hY} — Hicri-Miladi tarih dönüştürme, Mekke'deki Kâbe'ye doğru kıble yönü, zekât hesaplayıcı, Kuran ve Sünnet'ten sahih dualar ve ezkâr, ve dijital tesbih — tüm günlük Müslüman ihtiyaçları için tek uygulama.`,
            ur: `آج کے لیے اوقاتِ نماز اور ہجری کیلنڈر — ${_hMEn} ${_hY} — ہجری-عیسوی تاریخ کی تبدیلی، مکہ مکرمہ میں کعبہ کی طرف قبلہ کی سمت، زکاۃ کیلکولیٹر، قرآن و سنت سے صحیح دعائیں، اور ڈیجیٹل تسبیح — ایک مسلمان کی تمام روزانہ ضروریات ایک جگہ۔`,
            de: `Gebetszeiten und Hidschri-Kalender heute — ${_hMEn} ${_hY} AH — mit Hidschri-Gregorianischer Datumsumrechnung, Qibla-Richtung zur Kaaba in Mekka, Zakat-Rechner, authentischen Duas und Adhkar aus Koran und Sunna, und einer digitalen Tasbih — eine einzige Anwendung für alle täglichen Bedürfnisse des Muslim.`,
            id: `Jadwal Sholat dan Kalender Hijriyah hari ini — ${_hMEn} ${_hY} H — dengan konversi tanggal Hijriyah-Masehi, arah Kiblat menuju Kakbah di Mekah, kalkulator Zakat, doa dan dzikir otentik dari Al-Qur'an dan Sunnah, serta tasbih digital — satu aplikasi untuk setiap kebutuhan harian Muslim.`,
        }[Lh] || '';
        // NOTE: نُدرج <strong> حول العبارة المفتاحية في بداية كل فقرة
        //       (Use keywords in important HTML tags). الفقرات static تُنشأ أعلاه،
        //       لذا _escHtml لا يُستدعى على الـ tags نفسها.
        const keyPhraseHtml = {
            ar: '<strong>مواقيت الصلاة والتاريخ الهجري</strong>',
            en: '<strong>Prayer Times and Hijri Calendar</strong>',
            fr: '<strong>Heures de prière et calendrier Hégirien</strong>',
            tr: '<strong>Namaz Vakitleri ve Hicri Takvim</strong>',
            ur: '<strong>اوقاتِ نماز اور ہجری کیلنڈر</strong>',
            de: '<strong>Gebetszeiten und Hidschri-Kalender</strong>',
            id: '<strong>Jadwal Sholat dan Kalender Hijriyah</strong>',
        }[Lh] || '';
        function _wrapKey(text, key) {
            if (!key || !text) return _escHtml(text);
            const plainKey = key.replace(/<\/?strong>/g, '');
            const idx = text.indexOf(plainKey);
            if (idx < 0) return _escHtml(text);
            const before = _escHtml(text.slice(0, idx));
            const after  = _escHtml(text.slice(idx + plainKey.length));
            return before + key + after;
        }
        if (homeL1) html = html.replace(
            '<p class="seo-line" id="seo-line-1"></p>',
            `<p class="seo-line" id="seo-line-1">${_wrapKey(homeL1, keyPhraseHtml)}</p>`
        );
        if (homeL2) html = html.replace(
            '<p class="seo-line" id="seo-line-2"></p>',
            `<p class="seo-line" id="seo-line-2">${_wrapKey(homeL2, keyPhraseHtml)}</p>`
        );

        // ═══════════════════════════════════════════════════════════════════
        // Round 7f: LLM Readability — استبدال placeholders بمحتوى SSR افتراضي
        // ═══════════════════════════════════════════════════════════════════
        // الصفحة الرئيسية حصراً (لا نطبّق على /zakat-calculator/...)
        const _corePathHome = urlPath.replace(/^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?/, '/')
                                     .replace(/\.html$/, '').replace(/\/index$/, '/');
        const _isHomepage = (_corePathHome === '/' || _corePathHome === '');

        if (_isHomepage) {
            // —— نصوص محلّية (5 لغات) لـ fallback text ——
            const i18n = {
                ar: {
                    worldCities: 'مدن العالم', upcomingPrayer: 'الصلاة القادمة',
                    setLocation: 'حدّد موقعك لعرض الأوقات', variesByLocation: 'يختلف حسب الموقع',
                    towardsMecca: 'نحو مكة المكرمة', currentMoonPhase: 'طور القمر اليوم',
                    setLocationInfo: 'حدّد موقعك لعرض المعلومات الكاملة',
                    aboutTitle: 'عن موقع مواقيت الصلاة',
                    aboutP1: 'موقع مواقيت الصلاة والتاريخ الهجري يوفّر جدولاً يومياً دقيقاً لمواعيد الصلوات الخمس (الفجر، الشروق، الظهر، العصر، المغرب، العشاء) في أكثر من 50 ألف مدينة حول العالم، وذلك بالاعتماد على إحداثيات GPS الخاصّة بموقعك أو بالبحث اليدوي عن اسم مدينتك.',
                    aboutP2: 'يدعم الموقع عدّة طرق حساب معتمَدة عالمياً: رابطة العالم الإسلامي، هيئة أم القرى بمكة المكرمة، الهيئة المصرية العامة للمساحة، الجمعية الإسلامية لأمريكا الشمالية (ISNA)، إضافةً إلى خيارات مذاهب الفقه (الشافعي/الحنفي) لحساب وقت صلاة العصر.',
                    aboutP3: 'إلى جانب مواقيت الصلاة اليوم، يقدّم الموقع أدوات إسلامية متكاملة: التقويم الهجري بأشهره الاثني عشر (محرم، صفر، ربيع الأول، ربيع الآخر، جمادى الأولى، جمادى الآخرة، رجب، شعبان، رمضان، شوال، ذو القعدة، ذو الحجة)، تحويل التاريخ بين الهجري والميلادي، اتجاه القبلة نحو الكعبة المشرفة، حاسبة الزكاة، والأدعية والأذكار الصحيحة من الكتاب والسنة.',
                    faqQ1: 'كيف تُحسب مواقيت الصلاة؟',
                    faqA1: 'تُحسب مواقيت الصلاة الخمس (الفجر، الظهر، العصر، المغرب، العشاء) بناءً على موقع الشمس بالنسبة لخط الأفق في موقعك الجغرافي. يُحدَّد وقت الفجر والعشاء بزاوية الشمس تحت الأفق (تتراوح بين 15° و 19° حسب طريقة الحساب).',
                    faqQ2: 'ما الفرق بين طرق الحساب المختلفة؟',
                    faqA2: 'تختلف طرق الحساب (رابطة العالم الإسلامي، أم القرى، الهيئة المصرية، ISNA) بشكل رئيسي في زاوية الفجر والعشاء. مثلاً: رابطة العالم الإسلامي تعتمد 18° للفجر و 17° للعشاء، بينما أم القرى تعتمد 18.5° للفجر وساعتين ونصف بعد المغرب للعشاء في رمضان.',
                    faqQ3: 'ما هو التقويم الهجري؟',
                    faqA3: 'التقويم الهجري هو تقويم قمري إسلامي يبدأ من هجرة النبي محمد ﷺ عام 622م. يتكوّن من 12 شهراً قمرياً (محرم، صفر، ربيع الأول، ربيع الآخر، جمادى الأولى، جمادى الآخرة، رجب، شعبان، رمضان، شوال، ذو القعدة، ذو الحجة) مجموع أيامه 354 أو 355 يوماً.',
                    faqQ4: 'كيف أحدّد اتجاه القبلة؟',
                    faqA4: 'اتجاه القبلة هو الاتجاه الذي يواجهه المسلم في صلاته نحو الكعبة المشرفة في مكة المكرمة. يُحسب بمعرفة إحداثيات موقعك (خط الطول والعرض) وإحداثيات الكعبة (21.422487° شمالاً، 39.826206° شرقاً) باستخدام حساب الزوايا الكروي (Great Circle).',
                    faqQ5: 'هل مواقيت الصلاة المعروضة دقيقة؟',
                    faqA5: 'نعم، المواقيت تُحسب بخوارزميات فلكية دقيقة معتمدة على موقع الشمس الحقيقي في السماء. قد تختلف بدقيقتين أو ثلاث عن مواقيت الهيئات الرسمية في بعض الدول بسبب اختلاف طريقة الحساب — لذا نُتيح اختيار طريقة الحساب المفضّلة لديك من الإعدادات.',
                    faqQ6: 'ما هي ساعات الصيام في رمضان؟',
                    faqA6: 'ساعات الصيام هي الفترة من طلوع الفجر الصادق حتى غروب الشمس (أذان المغرب). تختلف من مدينة لأخرى حسب خط العرض والفصل السنوي. مثلاً: في مكة المكرمة ~14-15 ساعة، في القاهرة ~15 ساعة، في إسطنبول ~16-17 ساعة، في شمال أوروبا قد تصل إلى 19 ساعة.',
                },
                en: {
                    worldCities: 'Cities Worldwide', upcomingPrayer: 'Upcoming Prayer',
                    setLocation: 'Set your location to view times', variesByLocation: 'Varies by location',
                    towardsMecca: 'Toward Mecca', currentMoonPhase: "Today's moon phase",
                    setLocationInfo: 'Set your location for full info',
                    aboutTitle: 'About Prayer Times Site',
                    aboutP1: 'Prayer Times & Hijri Calendar website provides an accurate daily schedule for the five prayers (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) in over 50,000 cities worldwide, using your GPS coordinates or manual city search.',
                    aboutP2: 'The site supports globally recognized calculation methods: Muslim World League, Umm al-Qura (Mecca), Egyptian General Authority of Survey, Islamic Society of North America (ISNA), plus Shafi/Hanafi juristic options for Asr prayer calculation.',
                    aboutP3: 'Beyond today\'s prayer times, the site offers integrated Islamic tools: the Hijri calendar with its twelve months (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha\'ban, Ramadan, Shawwal, Dhu al-Qi\'dah, Dhu al-Hijjah), Hijri-Gregorian date converter, Qibla direction to the Kaaba, Zakat calculator, and authentic duas and adhkar from the Quran and Sunnah.',
                    faqQ1: 'How are prayer times calculated?',
                    faqA1: 'The five prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) are calculated based on the sun\'s position relative to your horizon. Fajr and Isha times are determined by the sun\'s angle below the horizon (between 15° and 19° depending on the calculation method).',
                    faqQ2: 'What is the difference between calculation methods?',
                    faqA2: 'Calculation methods (Muslim World League, Umm al-Qura, Egyptian Authority, ISNA) differ primarily in Fajr and Isha angles. For example: MWL uses 18° for Fajr and 17° for Isha, while Umm al-Qura uses 18.5° for Fajr and 90 minutes after Maghrib for Isha (120 minutes in Ramadan).',
                    faqQ3: 'What is the Hijri calendar?',
                    faqA3: 'The Hijri calendar is a lunar Islamic calendar that began with Prophet Muhammad\'s migration (Hijra) in 622 AD. It consists of 12 lunar months (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha\'ban, Ramadan, Shawwal, Dhu al-Qi\'dah, Dhu al-Hijjah) totaling 354 or 355 days.',
                    faqQ4: 'How is Qibla direction determined?',
                    faqA4: 'Qibla is the direction Muslims face during prayer, toward the Kaaba in Mecca. It is calculated from your location coordinates (latitude and longitude) and the Kaaba coordinates (21.422487°N, 39.826206°E) using Great Circle bearing calculation.',
                    faqQ5: 'Are the displayed prayer times accurate?',
                    faqA5: 'Yes, times are calculated using precise astronomical algorithms based on the real position of the sun. They may differ by 2-3 minutes from official national bodies due to calculation method differences — so we offer the option to choose your preferred method in Settings.',
                    faqQ6: 'What are fasting hours in Ramadan?',
                    faqA6: 'Fasting hours span from true dawn (Fajr) to sunset (Maghrib). Duration varies by city based on latitude and season. For example: Mecca ~14-15 hours, Cairo ~15 hours, Istanbul ~16-17 hours, and in northern Europe it may reach 19 hours.',
                },
                fr: {
                    worldCities: 'Villes du Monde', upcomingPrayer: 'Prochaine prière',
                    setLocation: 'Définissez votre localisation', variesByLocation: 'Varie selon la localisation',
                    towardsMecca: 'Vers La Mecque', currentMoonPhase: "Phase lunaire aujourd'hui",
                    setLocationInfo: 'Définissez votre localisation pour voir les infos',
                    aboutTitle: 'À propos du site Heures de prière',
                    aboutP1: "Le site Heures de prière et Calendrier Hégirien fournit un horaire quotidien précis des cinq prières (Fajr, Dhuhr, Asr, Maghrib, Isha) dans plus de 50 000 villes du monde, en utilisant vos coordonnées GPS ou la recherche manuelle de ville.",
                    aboutP2: "Le site prend en charge les méthodes de calcul reconnues mondialement : Ligue Islamique Mondiale, Umm al-Qura (La Mecque), Autorité Égyptienne, ISNA, avec options juristiques Shafi/Hanafi pour Asr.",
                    aboutP3: "Au-delà des heures de prière, le site offre des outils islamiques intégrés : calendrier hégirien (Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sha'ban, Ramadan, Shawwal, Dhu al-Qi'dah, Dhu al-Hijjah), convertisseur de date, direction de la Qibla vers la Kaaba, calculateur de Zakat, et douas et adhkar authentiques.",
                    faqQ1: 'Comment les heures de prière sont-elles calculées ?',
                    faqA1: "Les cinq heures de prière (Fajr, Dhuhr, Asr, Maghrib, Isha) sont calculées en fonction de la position du soleil par rapport à votre horizon. Fajr et Isha dépendent de l'angle du soleil sous l'horizon (entre 15° et 19° selon la méthode).",
                    faqQ2: 'Quelle est la différence entre les méthodes de calcul ?',
                    faqA2: 'Les méthodes (Ligue Islamique Mondiale, Umm al-Qura, Égyptienne, ISNA) diffèrent principalement par les angles de Fajr et Isha. Ex : MWL utilise 18° Fajr / 17° Isha ; Umm al-Qura utilise 18,5° Fajr et 90 min après Maghrib pour Isha (120 min en Ramadan).',
                    faqQ3: 'Quel est le calendrier hégirien ?',
                    faqA3: "Le calendrier hégirien est un calendrier lunaire islamique qui a débuté avec l'Hégire du Prophète Muhammad en 622 ap. J.-C. Il comprend 12 mois lunaires totalisant 354 ou 355 jours.",
                    faqQ4: 'Comment détermine-t-on la direction de la Qibla ?',
                    faqA4: "La Qibla est la direction de la Kaaba à La Mecque. Elle est calculée à partir de vos coordonnées (latitude/longitude) et des coordonnées de la Kaaba (21,422487°N, 39,826206°E) par la méthode du Grand Cercle.",
                    faqQ5: 'Les heures affichées sont-elles précises ?',
                    faqA5: "Oui, les heures sont calculées par des algorithmes astronomiques précis basés sur la position réelle du soleil. Elles peuvent varier de 2-3 minutes par rapport aux autorités officielles selon la méthode.",
                    faqQ6: 'Quelles sont les heures de jeûne en Ramadan ?',
                    faqA6: "Les heures de jeûne s'étendent de l'aube vraie (Fajr) au coucher (Maghrib). La Mecque ~14-15 h, Le Caire ~15 h, Istanbul ~16-17 h, nord de l'Europe jusqu'à 19 h.",
                },
                tr: {
                    worldCities: 'Dünya Şehirleri', upcomingPrayer: 'Sonraki Namaz',
                    setLocation: 'Vakitleri görmek için konumunuzu belirleyin', variesByLocation: 'Konuma göre değişir',
                    towardsMecca: "Kâbe'ye doğru", currentMoonPhase: 'Bugünkü ay fazı',
                    setLocationInfo: 'Tam bilgi için konum belirleyin',
                    aboutTitle: 'Namaz Vakitleri Hakkında',
                    aboutP1: 'Namaz Vakitleri ve Hicri Takvim sitesi, dünya genelinde 50.000\'den fazla şehir için beş vakit namazı (Fecir, Öğle, İkindi, Akşam, Yatsı) GPS koordinatları veya manuel şehir araması kullanarak sunar.',
                    aboutP2: "Site, dünya çapında tanınan hesaplama yöntemlerini destekler: Müslüman Dünya Birliği, Ümmü'l-Kura (Mekke), Mısır Otoritesi, ISNA; ayrıca İkindi için Şafi/Hanefi seçenekleri.",
                    aboutP3: "Namaz vakitlerinin yanı sıra site, Hicri takvim (Muharrem, Safer, Rabiülevvel, Rabiülahir, Cemaziyelevvel, Cemaziyelahir, Recep, Şaban, Ramazan, Şevval, Zilkade, Zilhicce), tarih dönüştürücü, Kâbe yönünde kıble, zekât hesaplayıcı ve sahih dualar sunar.",
                    faqQ1: 'Namaz vakitleri nasıl hesaplanır?',
                    faqA1: "Beş vakit namaz (Fecir, Öğle, İkindi, Akşam, Yatsı) güneşin ufka göre konumuna göre hesaplanır. Fecir ve Yatsı, güneşin ufkun altındaki açısıyla belirlenir (yönteme göre 15°-19° arası).",
                    faqQ2: 'Hesaplama yöntemleri arasındaki fark nedir?',
                    faqA2: "Yöntemler (MWL, Ümmü'l-Kura, Mısır, ISNA) esas olarak Fecir ve Yatsı açılarında farklıdır. Örneğin MWL Fecir için 18°, Yatsı için 17° kullanır.",
                    faqQ3: 'Hicri takvim nedir?',
                    faqA3: "Hicri takvim, Hz. Muhammed'in 622'deki hicretiyle başlayan ay takvimidir. 12 aydan oluşur, toplam 354 veya 355 gündür.",
                    faqQ4: 'Kıble yönü nasıl belirlenir?',
                    faqA4: "Kıble, Mekke'deki Kâbe yönüdür. Koordinatlarınız ve Kâbe koordinatları (21,422487°K, 39,826206°D) kullanılarak Büyük Daire yöntemiyle hesaplanır.",
                    faqQ5: 'Gösterilen namaz vakitleri doğru mu?',
                    faqA5: 'Evet, vakitler güneşin gerçek konumuna dayalı hassas astronomik algoritmalarla hesaplanır. Yöntem farklılıklarından dolayı resmi kurumlarla 2-3 dakika fark olabilir.',
                    faqQ6: 'Ramazan oruç süreleri nedir?',
                    faqA6: 'Oruç süresi gerçek şafaktan (Fecir) güneş batımına (Akşam) kadardır. Mekke ~14-15 saat, Kahire ~15 saat, İstanbul ~16-17 saat, Kuzey Avrupa 19 saate kadar.',
                },
                ur: {
                    worldCities: 'دنیا کے شہر', upcomingPrayer: 'اگلی نماز',
                    setLocation: 'اوقات دیکھنے کے لیے اپنا مقام طے کریں', variesByLocation: 'مقام کے مطابق مختلف',
                    towardsMecca: 'مکہ مکرمہ کی طرف', currentMoonPhase: 'آج چاند کا طور',
                    setLocationInfo: 'مکمل معلومات کے لیے اپنا مقام طے کریں',
                    aboutTitle: 'اوقاتِ نماز سائٹ کے بارے میں',
                    aboutP1: 'اوقاتِ نماز اور ہجری کیلنڈر سائٹ دنیا بھر کے 50,000 سے زائد شہروں میں پانچوں نمازوں (فجر، ظہر، عصر، مغرب، عشاء) کا درست روزانہ شیڈول آپ کے GPS کوآرڈینیٹس یا دستی شہر تلاش کے ذریعے فراہم کرتی ہے۔',
                    aboutP2: 'سائٹ عالمی سطح پر تسلیم شدہ حساب کے طریقوں کی حمایت کرتی ہے: مسلم ورلڈ لیگ، ام القریٰ (مکہ)، مصری اتھارٹی، ISNA؛ علاوہ ازیں عصر کے لیے شافعی/حنفی اختیارات۔',
                    aboutP3: 'اوقاتِ نماز کے علاوہ، سائٹ مربوط اسلامی ٹولز پیش کرتی ہے: ہجری کیلنڈر (محرم، صفر، ربیع الاول، ربیع الآخر، جمادی الاولیٰ، جمادی الآخرہ، رجب، شعبان، رمضان، شوال، ذوالقعدہ، ذوالحجہ)، تاریخ کنورٹر، کعبہ کی طرف قبلہ، زکاۃ کیلکولیٹر، اور صحیح دعائیں اور اذکار۔',
                    faqQ1: 'اوقاتِ نماز کیسے شمار ہوتے ہیں؟',
                    faqA1: 'پانچوں اوقاتِ نماز (فجر، ظہر، عصر، مغرب، عشاء) سورج کی آپ کے افق کے نسبت پوزیشن پر شمار ہوتے ہیں۔ فجر اور عشاء افق کے نیچے سورج کے زاویے سے طے ہوتے ہیں (15°-19° کے درمیان)۔',
                    faqQ2: 'حساب کے طریقوں میں کیا فرق ہے؟',
                    faqA2: 'طریقے (مسلم ورلڈ لیگ، ام القریٰ، مصری، ISNA) بنیادی طور پر فجر اور عشاء کے زاویوں میں مختلف ہیں۔',
                    faqQ3: 'ہجری کیلنڈر کیا ہے؟',
                    faqA3: 'ہجری کیلنڈر ایک قمری اسلامی کیلنڈر ہے جو 622 عیسوی میں نبی محمد ﷺ کی ہجرت سے شروع ہوا۔ 12 قمری مہینوں پر مشتمل ہے، کل 354 یا 355 دن۔',
                    faqQ4: 'قبلہ کی سمت کیسے طے ہوتی ہے؟',
                    faqA4: 'قبلہ مکہ مکرمہ میں کعبہ کی طرف رخ ہے۔ آپ کے کوآرڈینیٹس اور کعبہ کے کوآرڈینیٹس (21.422487°N، 39.826206°E) سے عظیم دائرہ طریقے سے شمار ہوتا ہے۔',
                    faqQ5: 'دکھائے گئے اوقاتِ نماز درست ہیں؟',
                    faqA5: 'جی ہاں، اوقات سورج کی حقیقی پوزیشن پر مبنی درست فلکیاتی الگورتھمز سے شمار ہوتے ہیں۔ طریقہ کار کے فرق کی وجہ سے 2-3 منٹ کا فرق ہو سکتا ہے۔',
                    faqQ6: 'رمضان میں روزے کے اوقات کیا ہیں؟',
                    faqA6: 'روزے کا دورانیہ حقیقی فجر سے مغرب تک ہوتا ہے۔ مکہ ~14-15 گھنٹے، قاہرہ ~15 گھنٹے، استنبول ~16-17 گھنٹے، شمالی یورپ 19 گھنٹے تک۔',
                },
                de: {
                    worldCities: 'Städte weltweit', upcomingPrayer: 'Nächstes Gebet',
                    setLocation: 'Legen Sie Ihren Standort fest, um die Zeiten anzuzeigen', variesByLocation: 'Variiert je nach Standort',
                    towardsMecca: 'Richtung Mekka', currentMoonPhase: 'Heutige Mondphase',
                    setLocationInfo: 'Legen Sie Ihren Standort fest, um alle Informationen anzuzeigen',
                    aboutTitle: 'Über die Webseite Gebetszeiten',
                    aboutP1: 'Die Webseite Gebetszeiten und Hidschri-Kalender bietet einen präzisen täglichen Zeitplan für die fünf Pflichtgebete (Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib, Isha) in über 50.000 Städten weltweit, basierend auf Ihren GPS-Koordinaten oder der manuellen Stadtsuche.',
                    aboutP2: "Die Seite unterstützt weltweit anerkannte Berechnungsmethoden: Muslimische Weltliga, Umm al-Qura (Mekka), Ägyptische Generalbehörde für Vermessung, Islamische Gesellschaft Nordamerikas (ISNA), sowie schafiitische/hanafitische Rechtsschul-Optionen für die Berechnung des Asr-Gebets.",
                    aboutP3: "Neben den Gebetszeiten bietet die Seite integrierte islamische Werkzeuge: Den Hidschri-Kalender mit seinen zwölf Monaten (Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Dschumada al-Ula, Dschumada al-Thani, Radschab, Schaban, Ramadan, Schawwal, Dhul-Qa'da, Dhul-Hidscha), Datumsumrechnung zwischen Hidschri und Gregorianisch, Qibla-Richtung zur Kaaba, Zakat-Rechner sowie authentische Duas und Adhkar aus Koran und Sunna.",
                    faqQ1: 'Wie werden die Gebetszeiten berechnet?',
                    faqA1: 'Die fünf Gebetszeiten (Fajr, Dhuhr, Asr, Maghrib, Isha) werden anhand der Position der Sonne relativ zu Ihrem Horizont berechnet. Fajr und Isha werden durch den Winkel der Sonne unter dem Horizont bestimmt (je nach Methode zwischen 15° und 19°).',
                    faqQ2: 'Was ist der Unterschied zwischen den Berechnungsmethoden?',
                    faqA2: "Die Methoden (Muslimische Weltliga, Umm al-Qura, Ägyptische Behörde, ISNA) unterscheiden sich hauptsächlich in den Fajr- und Isha-Winkeln. Beispiel: MWL verwendet 18° für Fajr und 17° für Isha, während Umm al-Qura 18,5° für Fajr und 90 Minuten nach Maghrib für Isha verwendet (120 Minuten im Ramadan).",
                    faqQ3: 'Was ist der Hidschri-Kalender?',
                    faqA3: "Der Hidschri-Kalender ist ein islamischer Mondkalender, der mit der Auswanderung (Hidschra) des Propheten Mohammed im Jahr 622 n. Chr. begann. Er besteht aus 12 Mondmonaten (Muharram, Safar, Rabi' al-Awwal, Rabi' al-Thani, Dschumada al-Ula, Dschumada al-Thani, Radschab, Schaban, Ramadan, Schawwal, Dhul-Qa'da, Dhul-Hidscha) und umfasst insgesamt 354 oder 355 Tage.",
                    faqQ4: 'Wie wird die Qibla-Richtung bestimmt?',
                    faqA4: 'Die Qibla ist die Richtung, in die Muslime während des Gebets zur Kaaba in Mekka blicken. Sie wird aus Ihren Standortkoordinaten (Breiten- und Längengrad) und den Koordinaten der Kaaba (21,422487°N, 39,826206°O) mittels Großkreisberechnung ermittelt.',
                    faqQ5: 'Sind die angezeigten Gebetszeiten genau?',
                    faqA5: 'Ja, die Zeiten werden mit präzisen astronomischen Algorithmen berechnet, die auf der tatsächlichen Position der Sonne basieren. Sie können aufgrund unterschiedlicher Berechnungsmethoden um 2-3 Minuten von offiziellen nationalen Stellen abweichen — daher bieten wir die Möglichkeit, Ihre bevorzugte Methode in den Einstellungen zu wählen.',
                    faqQ6: 'Wie lang sind die Fastenzeiten im Ramadan?',
                    faqA6: 'Die Fastenzeiten reichen vom wahren Morgengrauen (Fajr) bis zum Sonnenuntergang (Maghrib). Die Dauer variiert je nach Stadt abhängig von Breitengrad und Jahreszeit. Beispiel: Mekka ~14-15 Stunden, Kairo ~15 Stunden, Istanbul ~16-17 Stunden, im Norden Europas können es bis zu 19 Stunden sein.',
                },
                id: {
                    worldCities: 'Kota-Kota Dunia', upcomingPrayer: 'Sholat Berikutnya',
                    setLocation: 'Tetapkan lokasi Anda untuk melihat waktu', variesByLocation: 'Bervariasi menurut lokasi',
                    towardsMecca: 'Menuju Mekkah', currentMoonPhase: 'Fase bulan hari ini',
                    setLocationInfo: 'Tetapkan lokasi Anda untuk melihat informasi lengkap',
                    aboutTitle: 'Tentang Situs Jadwal Sholat',
                    aboutP1: 'Situs Jadwal Sholat dan Kalender Hijriyah menyediakan jadwal harian yang akurat untuk lima waktu sholat (Subuh, Matahari Terbit, Zuhur, Asar, Magrib, Isya) di lebih dari 50.000 kota di seluruh dunia, menggunakan koordinat GPS Anda atau pencarian kota secara manual.',
                    aboutP2: 'Situs ini mendukung metode perhitungan yang diakui secara global: Liga Dunia Muslim, Umm al-Qura (Mekkah), Otoritas Umum Mesir, Islamic Society of North America (ISNA), ditambah opsi mazhab Syafi\'i/Hanafi untuk perhitungan waktu sholat Asar.',
                    aboutP3: 'Selain jadwal sholat hari ini, situs ini menawarkan perangkat Islam terpadu: kalender Hijriyah dengan dua belas bulannya (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sya\'ban, Ramadan, Syawal, Dzulkaidah, Dzulhijah), konverter tanggal Hijriyah-Masehi, arah Kiblat menuju Ka\'bah, kalkulator Zakat, serta doa dan dzikir otentik dari Al-Qur\'an dan Sunnah.',
                    faqQ1: 'Bagaimana jadwal sholat dihitung?',
                    faqA1: 'Lima waktu sholat (Subuh, Zuhur, Asar, Magrib, Isya) dihitung berdasarkan posisi matahari terhadap cakrawala Anda. Waktu Subuh dan Isya ditentukan oleh sudut matahari di bawah cakrawala (antara 15° dan 19° tergantung pada metode perhitungan).',
                    faqQ2: 'Apa perbedaan antara metode perhitungan?',
                    faqA2: 'Metode perhitungan (Liga Dunia Muslim, Umm al-Qura, Otoritas Mesir, ISNA) berbeda terutama pada sudut Subuh dan Isya. Contoh: MWL menggunakan 18° untuk Subuh dan 17° untuk Isya, sementara Umm al-Qura menggunakan 18,5° untuk Subuh dan 90 menit setelah Magrib untuk Isya (120 menit di bulan Ramadan).',
                    faqQ3: 'Apa itu kalender Hijriyah?',
                    faqA3: 'Kalender Hijriyah adalah kalender lunar Islam yang dimulai dengan hijrahnya Nabi Muhammad ﷺ pada tahun 622 M. Kalender ini terdiri dari 12 bulan lunar (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Jumada al-Awwal, Jumada al-Thani, Rajab, Sya\'ban, Ramadan, Syawal, Dzulkaidah, Dzulhijah) dengan total 354 atau 355 hari.',
                    faqQ4: 'Bagaimana arah Kiblat ditentukan?',
                    faqA4: 'Kiblat adalah arah yang dihadap umat Muslim saat sholat, menuju Ka\'bah di Mekkah. Arah Kiblat dihitung dari koordinat lokasi Anda (lintang dan bujur) dan koordinat Ka\'bah (21,422487°LU, 39,826206°BT) menggunakan perhitungan Great Circle bearing.',
                    faqQ5: 'Apakah jadwal sholat yang ditampilkan akurat?',
                    faqA5: 'Ya, waktu dihitung menggunakan algoritma astronomi yang presisi berdasarkan posisi matahari yang sebenarnya. Waktu mungkin berbeda 2-3 menit dari otoritas resmi nasional karena perbedaan metode perhitungan — karena itu kami menyediakan pilihan metode perhitungan di Pengaturan.',
                    faqQ6: 'Berapa lama jam puasa di bulan Ramadan?',
                    faqA6: 'Jam puasa dimulai dari fajar sejati (Subuh) hingga matahari terbenam (Magrib). Durasinya bervariasi menurut kota berdasarkan lintang dan musim. Contoh: Mekkah ~14-15 jam, Kairo ~15 jam, Istanbul ~16-17 jam, di Eropa utara bisa mencapai 19 jam.',
                },
                es: {
                    worldCities: 'Ciudades del Mundo', upcomingPrayer: 'Próxima Oración',
                    setLocation: 'Establece tu ubicación para ver los horarios', variesByLocation: 'Varía según la ubicación',
                    towardsMecca: 'Hacia La Meca', currentMoonPhase: 'Fase lunar de hoy',
                    setLocationInfo: 'Establece tu ubicación para ver la información completa',
                    aboutTitle: 'Acerca del sitio Horarios de Oración',
                    aboutP1: 'El sitio Horarios de Oración y Calendario Hijri ofrece un horario diario preciso para las cinco oraciones (Fayr, Amanecer, Dhuhr, Asr, Magrib, Isha) en más de 50 000 ciudades del mundo, utilizando tus coordenadas GPS o la búsqueda manual por nombre de ciudad.',
                    aboutP2: 'El sitio admite métodos de cálculo reconocidos mundialmente: Liga Mundial Musulmana, Umm al-Qura (La Meca), Autoridad General Egipcia, Islamic Society of North America (ISNA), además de las opciones jurídicas Shafi\'i/Hanafi para el cálculo del Asr.',
                    aboutP3: 'Además de los horarios de oración de hoy, el sitio ofrece herramientas islámicas integradas: el calendario Hijri con sus doce meses (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Yumada al-Awwal, Yumada al-Thani, Rayab, Sha\'ban, Ramadán, Shawwal, Dhu al-Qi\'dah, Dhu al-Hiyyah), conversor de fechas Hijri-Gregoriano, dirección de la Qibla hacia la Kaaba, calculadora de Zakat y duas y adhkar auténticos del Corán y la Sunna.',
                    faqQ1: '¿Cómo se calculan los horarios de oración?',
                    faqA1: 'Las cinco oraciones (Fayr, Dhuhr, Asr, Magrib, Isha) se calculan según la posición del sol respecto a tu horizonte. Los horarios de Fayr e Isha se determinan por el ángulo del sol bajo el horizonte (entre 15° y 19° según el método de cálculo).',
                    faqQ2: '¿Cuál es la diferencia entre los métodos de cálculo?',
                    faqA2: 'Los métodos (Liga Mundial Musulmana, Umm al-Qura, Autoridad Egipcia, ISNA) difieren principalmente en los ángulos de Fayr e Isha. Por ejemplo: MWL usa 18° para Fayr y 17° para Isha, mientras que Umm al-Qura usa 18,5° para Fayr y 90 minutos después del Magrib para Isha (120 minutos en Ramadán).',
                    faqQ3: '¿Qué es el calendario Hijri?',
                    faqA3: 'El calendario Hijri es un calendario lunar islámico que comenzó con la Hégira del Profeta Muhammad ﷺ en el año 622 d.C. Consta de 12 meses lunares (Muharram, Safar, Rabi\' al-Awwal, Rabi\' al-Thani, Yumada al-Awwal, Yumada al-Thani, Rayab, Sha\'ban, Ramadán, Shawwal, Dhu al-Qi\'dah, Dhu al-Hiyyah) con un total de 354 o 355 días.',
                    faqQ4: '¿Cómo se determina la dirección de la Qibla?',
                    faqA4: 'La Qibla es la dirección hacia la Kaaba en La Meca que los musulmanes encaran durante la oración. Se calcula a partir de tus coordenadas (latitud y longitud) y las de la Kaaba (21,422487°N, 39,826206°E) mediante el cálculo del rumbo de gran círculo.',
                    faqQ5: '¿Son precisos los horarios de oración mostrados?',
                    faqA5: 'Sí, los horarios se calculan con algoritmos astronómicos precisos basados en la posición real del sol. Pueden variar 2-3 minutos respecto a las autoridades oficiales nacionales debido a diferencias en el método de cálculo — por eso ofrecemos la opción de elegir tu método preferido en los Ajustes.',
                    faqQ6: '¿Cuántas son las horas de ayuno en Ramadán?',
                    faqA6: 'Las horas de ayuno van desde el amanecer verdadero (Fayr) hasta la puesta del sol (Magrib). La duración varía según la ciudad, según la latitud y la estación. Por ejemplo: La Meca ~14-15 horas, El Cairo ~15 horas, Estambul ~16-17 horas, y en el norte de Europa puede llegar a 19 horas.',
                },
                bn: {
                    worldCities: 'বিশ্বের শহরসমূহ', upcomingPrayer: 'পরবর্তী নামাজ',
                    setLocation: 'সময়সূচী দেখতে আপনার অবস্থান নির্ধারণ করুন', variesByLocation: 'অবস্থান অনুযায়ী পরিবর্তিত',
                    towardsMecca: 'মক্কার দিকে', currentMoonPhase: 'আজকের চাঁদের পর্যায়',
                    setLocationInfo: 'সম্পূর্ণ তথ্য দেখতে আপনার অবস্থান নির্ধারণ করুন',
                    aboutTitle: 'নামাজের সময়সূচী ওয়েবসাইট সম্পর্কে',
                    aboutP1: 'নামাজের সময়সূচী ও হিজরি ক্যালেন্ডার ওয়েবসাইট বিশ্বজুড়ে ৫০,০০০-এর বেশি শহরের জন্য পাঁচ ওয়াক্ত নামাজের (ফজর, সূর্যোদয়, জোহর, আসর, মাগরিব, এশা) সঠিক দৈনিক সময়সূচী সরবরাহ করে, আপনার GPS স্থানাঙ্ক বা ম্যানুয়াল শহর অনুসন্ধানের ভিত্তিতে।',
                    aboutP2: 'এই সাইটটি বিশ্বব্যাপী স্বীকৃত গণনা পদ্ধতি সমর্থন করে: মুসলিম ওয়ার্ল্ড লীগ, উম্মুল কুরা (মক্কা), মিশরের সাধারণ কর্তৃপক্ষ, Islamic Society of North America (ISNA), এবং আসরের সময় গণনার জন্য শাফেয়ী/হানাফি মাজহাব বিকল্প।',
                    aboutP3: 'আজকের নামাজের সময় ছাড়াও, সাইটটি সমন্বিত ইসলামী সরঞ্জাম অফার করে: বারো মাসের হিজরি ক্যালেন্ডার (মহররম, সফর, রবিউল আউয়াল, রবিউস সানি, জমাদিউল আউয়াল, জমাদিউস সানি, রজব, শাবান, রমজান, শাওয়াল, জিলকদ, জিলহজ), হিজরি-গ্রেগরিয়ান তারিখ রূপান্তরকারী, কাবার দিকে কিবলার দিক, যাকাত ক্যালকুলেটর এবং কুরআন ও সুন্নাহ থেকে সহীহ দোয়া ও জিকির।',
                    faqQ1: 'নামাজের সময়সূচী কীভাবে গণনা করা হয়?',
                    faqA1: 'পাঁচ ওয়াক্ত নামাজ (ফজর, জোহর, আসর, মাগরিব, এশা) আপনার দিগন্তের সাপেক্ষে সূর্যের অবস্থানের ভিত্তিতে গণনা করা হয়। ফজর ও এশার সময় দিগন্তের নিচে সূর্যের কোণ দ্বারা নির্ধারিত হয় (গণনা পদ্ধতি অনুযায়ী ১৫° থেকে ১৯° এর মধ্যে)।',
                    faqQ2: 'বিভিন্ন গণনা পদ্ধতির মধ্যে পার্থক্য কী?',
                    faqA2: 'গণনা পদ্ধতি (মুসলিম ওয়ার্ল্ড লীগ, উম্মুল কুরা, মিশরীয় কর্তৃপক্ষ, ISNA) প্রধানত ফজর ও এশার কোণে পার্থক্য রাখে। উদাহরণস্বরূপ: MWL ফজরের জন্য ১৮° এবং এশার জন্য ১৭° ব্যবহার করে, যেখানে উম্মুল কুরা ফজরের জন্য ১৮.৫° এবং এশার জন্য মাগরিবের ৯০ মিনিট পরে (রমজানে ১২০ মিনিট) ব্যবহার করে।',
                    faqQ3: 'হিজরি ক্যালেন্ডার কী?',
                    faqA3: 'হিজরি ক্যালেন্ডার একটি চান্দ্র ইসলামিক ক্যালেন্ডার যা ৬২২ খ্রিস্টাব্দে নবী মুহাম্মদ ﷺ-এর হিজরত থেকে শুরু হয়েছিল। এটি ১২টি চান্দ্র মাস নিয়ে গঠিত (মহররম, সফর, রবিউল আউয়াল, রবিউস সানি, জমাদিউল আউয়াল, জমাদিউস সানি, রজব, শাবান, রমজান, শাওয়াল, জিলকদ, জিলহজ) মোট ৩৫৪ বা ৩৫৫ দিন।',
                    faqQ4: 'কিবলার দিক কীভাবে নির্ধারণ করা হয়?',
                    faqA4: 'কিবলা হলো সেই দিক যেদিকে মুসলিমরা নামাজের সময় মুখ ফেরায়, মক্কার কাবার দিকে। এটি আপনার অবস্থানের স্থানাঙ্ক (অক্ষাংশ ও দ্রাঘিমাংশ) এবং কাবার স্থানাঙ্ক (২১.৪২২৪৮৭°N, ৩৯.৮২৬২০৬°E) থেকে Great Circle bearing গণনা ব্যবহার করে নির্ণয় করা হয়।',
                    faqQ5: 'প্রদর্শিত নামাজের সময়সূচী কি সঠিক?',
                    faqA5: 'হ্যাঁ, সময় সূর্যের প্রকৃত অবস্থানের ভিত্তিতে সুনির্দিষ্ট জ্যোতির্বিদ্যা অ্যালগরিদম ব্যবহার করে গণনা করা হয়। গণনা পদ্ধতির পার্থক্যের কারণে আনুষ্ঠানিক জাতীয় কর্তৃপক্ষের থেকে ২-৩ মিনিট ভিন্ন হতে পারে — তাই আমরা সেটিংসে আপনার পছন্দের পদ্ধতি নির্বাচন করার বিকল্প প্রদান করি।',
                    faqQ6: 'রমজানে রোজার সময় কত ঘণ্টা?',
                    faqA6: 'রোজার সময় প্রকৃত ফজর থেকে সূর্যাস্ত (মাগরিব) পর্যন্ত। সময়কাল অক্ষাংশ এবং ঋতুর উপর নির্ভর করে শহর ভেদে পরিবর্তিত হয়। উদাহরণস্বরূপ: মক্কা ~১৪-১৫ ঘণ্টা, কায়রো ~১৫ ঘণ্টা, ইস্তাম্বুল ~১৬-১৭ ঘণ্টা, উত্তর ইউরোপে ১৯ ঘণ্টা পর্যন্ত হতে পারে।',
                },
                ms: {
                    worldCities: 'Bandar Dunia', upcomingPrayer: 'Solat Seterusnya',
                    setLocation: 'Tetapkan lokasi anda untuk melihat waktu', variesByLocation: 'Berbeza mengikut lokasi',
                    towardsMecca: 'Ke arah Makkah', currentMoonPhase: 'Fasa bulan hari ini',
                    setLocationInfo: 'Tetapkan lokasi anda untuk melihat maklumat penuh',
                    aboutTitle: 'Mengenai Laman Waktu Solat',
                    aboutP1: 'Laman Waktu Solat dan Kalendar Hijrah menyediakan jadual harian yang tepat untuk lima waktu solat (Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak) di lebih 50,000 bandar seluruh dunia, menggunakan koordinat GPS anda atau carian bandar secara manual.',
                    aboutP2: 'Laman ini menyokong kaedah pengiraan yang diiktiraf di peringkat global: Liga Dunia Muslim, Umm al-Qura (Makkah), Pihak Berkuasa Am Mesir, Islamic Society of North America (ISNA), serta pilihan mazhab Syafie/Hanafi untuk pengiraan waktu Asar.',
                    aboutP3: 'Selain waktu solat hari ini, laman ini menawarkan alatan Islam bersepadu: Kalendar Hijrah dengan dua belas bulannya (Muharram, Safar, Rabiulawal, Rabiulakhir, Jamadilawal, Jamadilakhir, Rejab, Syaaban, Ramadan, Syawal, Zulkaedah, Zulhijah), penukar tarikh Hijrah-Masihi, arah Kiblat ke Kaabah, kalkulator Zakat, serta doa dan zikir sahih daripada Al-Quran dan Sunnah.',
                    faqQ1: 'Bagaimana waktu solat dikira?',
                    faqA1: 'Lima waktu solat (Subuh, Zohor, Asar, Maghrib, Isyak) dikira berdasarkan kedudukan matahari berbanding ufuk anda. Waktu Subuh dan Isyak ditentukan oleh sudut matahari di bawah ufuk (antara 15° dan 19° bergantung kepada kaedah pengiraan).',
                    faqQ2: 'Apakah perbezaan antara kaedah pengiraan?',
                    faqA2: 'Kaedah pengiraan (Liga Dunia Muslim, Umm al-Qura, Pihak Berkuasa Mesir, ISNA) berbeza terutamanya pada sudut Subuh dan Isyak. Contoh: MWL menggunakan 18° untuk Subuh dan 17° untuk Isyak, manakala Umm al-Qura menggunakan 18.5° untuk Subuh dan 90 minit selepas Maghrib untuk Isyak (120 minit pada bulan Ramadan).',
                    faqQ3: 'Apakah kalendar Hijrah?',
                    faqA3: 'Kalendar Hijrah ialah kalendar lunar Islam yang bermula dengan penghijrahan Nabi Muhammad ﷺ pada 622 Masihi. Ia terdiri daripada 12 bulan lunar (Muharram, Safar, Rabiulawal, Rabiulakhir, Jamadilawal, Jamadilakhir, Rejab, Syaaban, Ramadan, Syawal, Zulkaedah, Zulhijah) dengan jumlah 354 atau 355 hari.',
                    faqQ4: 'Bagaimana arah Kiblat ditentukan?',
                    faqA4: 'Kiblat ialah arah yang dihadap oleh umat Islam semasa solat, menuju ke Kaabah di Makkah. Arah Kiblat dikira daripada koordinat lokasi anda (latitud dan longitud) dan koordinat Kaabah (21.422487°U, 39.826206°T) menggunakan pengiraan Great Circle bearing.',
                    faqQ5: 'Adakah waktu solat yang dipaparkan tepat?',
                    faqA5: 'Ya, waktu dikira menggunakan algoritma astronomi yang tepat berdasarkan kedudukan sebenar matahari. Ia mungkin berbeza 2-3 minit daripada pihak berkuasa rasmi negara disebabkan perbezaan kaedah pengiraan — kerana itu kami menyediakan pilihan untuk memilih kaedah pilihan anda dalam Tetapan.',
                    faqQ6: 'Berapa lama waktu berpuasa dalam bulan Ramadan?',
                    faqA6: 'Waktu berpuasa adalah dari subuh sebenar (Subuh) hingga matahari terbenam (Maghrib). Tempohnya berbeza mengikut bandar berdasarkan latitud dan musim. Contoh: Makkah ~14-15 jam, Kaherah ~15 jam, Istanbul ~16-17 jam, di utara Eropah boleh mencapai 19 jam.',
                },
            }[Lh] || {};

            // —— تاريخ هجري + ميلادي للـ banner + info section ——
            const _hijriText = Lh === 'ar'
                ? `${_hN.day} ${_hMAr} ${_hY} هـ`
                : `${_hN.day} ${_hMEn} ${_hY} AH`;
            let _gregText;
            try {
                const localeMap = { ar: 'ar', en: 'en-US', fr: 'fr-FR', tr: 'tr-TR', ur: 'ur-PK', de: 'de-DE', id: 'id-ID', es: 'es-ES', bn: 'bn-BD', ms: 'ms-MY' };
                _gregText = new Date().toLocaleDateString(
                    localeMap[Lh] || 'en-US',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                );
            } catch(e) { _gregText = `${_gNow2.getDate()} ${_GREG_MONTHS[Lh === 'ar' ? 'ar' : 'en'][_gMIdx]} ${_gY2}`; }

            // —— Banner placeholders ——
            html = html.replace(
                '<span id="banner-city-name">--</span>',
                `<span id="banner-city-name">${_escHtml(i18n.worldCities || '')}</span>`
            );
            html = html.replace(
                '<div class="banner-next-prayer-name" id="next-prayer-name">--</div>',
                `<div class="banner-next-prayer-name" id="next-prayer-name">${_escHtml(i18n.upcomingPrayer || '')}</div>`
            );
            html = html.replace(
                '<div class="banner-date-hijri" id="banner-hijri-date">--</div>',
                `<div class="banner-date-hijri" id="banner-hijri-date">${_escHtml(_hijriText)}</div>`
            );
            html = html.replace(
                '<div class="banner-date-greg" id="banner-greg-date">--</div>',
                `<div class="banner-date-greg" id="banner-greg-date">${_escHtml(_gregText)}</div>`
            );

            // —— Info section placeholders ——
            html = html.replace(
                '<div class="info-location" id="info-location">--</div>',
                `<div class="info-location" id="info-location">${_escHtml(i18n.setLocationInfo || '')}</div>`
            );
            html = html.replace(
                '<div class="info-value" id="info-hijri">--</div>',
                `<div class="info-value" id="info-hijri">${_escHtml(_hijriText)}</div>`
            );
            html = html.replace(
                '<div class="info-value" id="info-gregorian">--</div>',
                `<div class="info-value" id="info-gregorian">${_escHtml(_gregText)}</div>`
            );
            html = html.replace(
                '<div class="info-value" id="info-fasting">--</div>',
                `<div class="info-value" id="info-fasting">${_escHtml(i18n.variesByLocation || '')}</div>`
            );

            // —— Quick-access sub labels ——
            html = html.replace(
                '<div class="qa-sub" id="qa-hijri-date">--</div>',
                `<div class="qa-sub" id="qa-hijri-date">${_escHtml(_hijriText)}</div>`
            );
            html = html.replace(
                '<div class="qa-sub" id="qa-qibla-dir">--</div>',
                `<div class="qa-sub" id="qa-qibla-dir">${_escHtml(i18n.towardsMecca || '')}</div>`
            );
            html = html.replace(
                '<div class="qa-sub" id="qa-moon-phase">--</div>',
                `<div class="qa-sub" id="qa-moon-phase">${_escHtml(i18n.currentMoonPhase || '')}</div>`
            );

            // —— FAQ (نحافظ على IDs الأصلية faq-q1/faq-a1-intro/faq-times-list/faq-q2/faq-a2
            //      حتّى يستطيع updateFaqSection() الـ client-side استبدال Q1+Q2 بمحتوى خاصّ بالمدينة.
            //      Q3-Q6 جديدة بدون IDs — تبقى ثابتة كـ SEO content للـ LLM crawlers) ——
            const _faqHtml = i18n.faqQ1 ? `
                    <!-- س1 — ID محفوظ للـ JS -->
                    <div class="faq-item">
                        <div class="faq-question" id="faq-q1">${_escHtml(i18n.faqQ1)}</div>
                        <div class="faq-answer">
                            <p id="faq-a1-intro">${_escHtml(i18n.faqA1)}</p>
                            <ul class="faq-times-list" id="faq-times-list"></ul>
                        </div>
                    </div>
                    <div class="faq-divider"></div>
                    <!-- س2 — ID محفوظ للـ JS -->
                    <div class="faq-item">
                        <div class="faq-question" id="faq-q2">${_escHtml(i18n.faqQ2)}</div>
                        <div class="faq-answer">
                            <p id="faq-a2">${_escHtml(i18n.faqA2)}</p>
                        </div>
                    </div>
                    <div class="faq-divider"></div>
                    <!-- Q3-Q6 SEO-only (لا IDs، لا تُعدَّل من JS) -->
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ3)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA3)}</p></div>
                    </div>
                    <div class="faq-divider"></div>
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ4)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA4)}</p></div>
                    </div>
                    <div class="faq-divider"></div>
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ5)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA5)}</p></div>
                    </div>
                    <div class="faq-divider"></div>
                    <div class="faq-item">
                        <div class="faq-question">${_escHtml(i18n.faqQ6)}</div>
                        <div class="faq-answer"><p>${_escHtml(i18n.faqA6)}</p></div>
                    </div>` : '';
            // نستبدل الكتلتين الفارغتين الأصليّتين (faq-q1 و faq-q2) بـ 6 أسئلة/أجوبة معلوماتيّة
            // مع الحفاظ على IDs الأصلية في أول سؤالين لتوافق JS
            html = html.replace(
                /<!-- س1 -->[\s\S]*?<div class="faq-divider"><\/div>\s*<!-- س2 -->[\s\S]*?<p id="faq-a2"><\/p>\s*<\/div>\s*<\/div>/,
                `<!-- SSR FAQ (Round 7f: LLM readability — IDs محفوظة للـ JS override) -->${_faqHtml}`
            );

            // —— About-site section (يُضاف قبل قسم روابط الفوتر) ——
            if (i18n.aboutTitle) {
                const _aboutHtml = `
                <!-- SSR About-site (Round 7f) -->
                <section class="section-card home-about" id="home-about" aria-labelledby="home-about-title">
                    <h2 id="home-about-title">${_escHtml(i18n.aboutTitle)}</h2>
                    <p>${_escHtml(i18n.aboutP1)}</p>
                    <p>${_escHtml(i18n.aboutP2)}</p>
                    <p>${_escHtml(i18n.aboutP3)}</p>
                </section>
                `;
                // نُدرج قبل section home-footer-links
                html = html.replace(
                    '<!-- روابط داخلية + خارجية + مشاركة — ثابتة في HTML (SEO-friendly) -->',
                    `${_aboutHtml}\n                <!-- روابط داخلية + خارجية + مشاركة — ثابتة في HTML (SEO-friendly) -->`
                );
            }
        }
    }

    // 5c) SSR لترجمات قسم روابط الفوتر (للمدن الشائعة + الخدمات + المصادر + المشاركة)
    //     يضمن أنّ الكراولر على /en/ /fr/ ... يرى نصوصاً بالـ locale الصحيح مباشرة
    {
        const Lf = seo.lang;
        const footerI18n = {
            ar: { pop:'🕌 مواقيت الصلاة في أبرز المدن', srv:'🧭 خدمات إسلامية أخرى',
                  refs:'📚 مصادر ومراجع خارجية',
                  refsText:'تعرّف على المزيد عن الصلاة في الإسلام من مصدر موسوعي:',
                  wikiText:'الصلاة على ويكيبيديا ↗',
                  share:'🔗 شارك الموقع',
                  l_hijri_today:'التاريخ الهجري اليوم', l_hijri_year:'التقويم الهجري 1447',
                  l_date_conv:'تحويل التاريخ', l_tasbih:'المسبحة الإلكترونية',
                  x:'تويتر/X', fb:'فيسبوك', wa:'واتساب', tg:'تلغرام' },
            en: { pop:'🕌 Prayer Times in Major Cities', srv:'🧭 Other Islamic Services',
                  refs:'📚 External References',
                  refsText:'Learn more about Salah in Islam from an encyclopedic source:',
                  wikiText:'Salah on Wikipedia ↗',
                  share:'🔗 Share This Site',
                  l_hijri_today:"Today's Hijri Date", l_hijri_year:'Hijri Calendar 1447',
                  l_date_conv:'Date Converter', l_tasbih:'Digital Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            fr: { pop:'🕌 Heures de prière dans les grandes villes', srv:'🧭 Autres services islamiques',
                  refs:'📚 Références externes',
                  refsText:"Apprenez-en plus sur la Salat en Islam à partir d'une source encyclopédique :",
                  wikiText:'Salat sur Wikipedia ↗',
                  share:'🔗 Partager ce site',
                  l_hijri_today:"Date Hijri d'aujourd'hui", l_hijri_year:'Calendrier Hijri 1447',
                  l_date_conv:'Convertisseur de date', l_tasbih:'Tasbih numérique',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            tr: { pop:'🕌 Büyük Şehirlerde Namaz Vakitleri', srv:'🧭 Diğer İslami Hizmetler',
                  refs:'📚 Dış Kaynaklar',
                  refsText:'İslam\'da namaz hakkında ansiklopedik bir kaynaktan daha fazla bilgi edinin:',
                  wikiText:'Wikipedia\'da Namaz ↗',
                  share:'🔗 Bu siteyi paylaş',
                  l_hijri_today:'Bugünün Hicri Tarihi', l_hijri_year:'Hicri Takvim 1447',
                  l_date_conv:'Tarih Dönüştürücü', l_tasbih:'Dijital Tesbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            ur: { pop:'🕌 بڑے شہروں میں اوقاتِ نماز', srv:'🧭 دیگر اسلامی خدمات',
                  refs:'📚 بیرونی حوالہ جات',
                  refsText:'اسلام میں نماز کے بارے میں ایک انسائیکلوپیڈیا ذریعہ سے مزید جانیں:',
                  wikiText:'نماز ویکیپیڈیا پر ↗',
                  share:'🔗 سائٹ شیئر کریں',
                  l_hijri_today:'آج کی ہجری تاریخ', l_hijri_year:'ہجری کیلنڈر 1447',
                  l_date_conv:'تاریخ کنورٹر', l_tasbih:'ڈیجیٹل تسبیح',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            de: { pop:'🕌 Gebetszeiten in großen Städten', srv:'🧭 Weitere islamische Dienste',
                  refs:'📚 Externe Quellen',
                  refsText:'Erfahren Sie mehr über das Gebet im Islam aus einer enzyklopädischen Quelle:',
                  wikiText:'Salah auf Wikipedia ↗',
                  share:'🔗 Diese Seite teilen',
                  l_hijri_today:'Heutiges Hidschri-Datum', l_hijri_year:'Hidschri-Kalender 1447',
                  l_date_conv:'Datumsumrechner', l_tasbih:'Digitale Tasbih',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            id: { pop:'🕌 Jadwal Sholat di Kota-Kota Besar', srv:'🧭 Layanan Islami Lainnya',
                  refs:'📚 Referensi Eksternal',
                  refsText:'Pelajari lebih lanjut tentang sholat dalam Islam dari sumber ensiklopedia:',
                  wikiText:'Sholat di Wikipedia ↗',
                  share:'🔗 Bagikan situs ini',
                  l_hijri_today:'Tanggal Hijriyah Hari Ini', l_hijri_year:'Kalender Hijriyah 1447',
                  l_date_conv:'Konverter Tanggal', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            es: { pop:'🕌 Horarios de Oración en Ciudades Principales', srv:'🧭 Otros Servicios Islámicos',
                  refs:'📚 Referencias Externas',
                  refsText:'Aprenda más sobre el Salah en el Islam desde una fuente enciclopédica:',
                  wikiText:'Salah en Wikipedia ↗',
                  share:'🔗 Compartir este sitio',
                  l_hijri_today:'Fecha Hijri de Hoy', l_hijri_year:'Calendario Hijri 1447',
                  l_date_conv:'Conversor de Fechas', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            bn: { pop:'🕌 প্রধান শহরগুলোতে নামাজের সময়', srv:'🧭 অন্যান্য ইসলামিক সেবা',
                  refs:'📚 বাহ্যিক রেফারেন্স',
                  refsText:'একটি বিশ্বকোষীয় উৎস থেকে ইসলামে সালাত সম্পর্কে আরও জানুন:',
                  wikiText:'উইকিপিডিয়ায় সালাত ↗',
                  share:'🔗 এই সাইট শেয়ার করুন',
                  l_hijri_today:'আজকের হিজরি তারিখ', l_hijri_year:'হিজরি ক্যালেন্ডার 1447',
                  l_date_conv:'তারিখ রূপান্তরকারী', l_tasbih:'ডিজিটাল তাসবিহ',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
            ms: { pop:'🕌 Waktu Solat di Bandar-Bandar Utama', srv:'🧭 Perkhidmatan Islam Lain',
                  refs:'📚 Rujukan Luar',
                  refsText:'Ketahui lebih lanjut tentang solat dalam Islam daripada sumber ensiklopedia:',
                  wikiText:'Solat di Wikipedia ↗',
                  share:'🔗 Kongsi laman ini',
                  l_hijri_today:'Tarikh Hijrah Hari Ini', l_hijri_year:'Kalendar Hijrah 1447',
                  l_date_conv:'Penukar Tarikh', l_tasbih:'Tasbih Digital',
                  x:'Twitter/X', fb:'Facebook', wa:'WhatsApp', tg:'Telegram' },
        };
        const f = footerI18n[Lf] || footerI18n.ar;
        html = html
            .replace(/<h2 id="home-footer-links-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="home-footer-links-title" data-i18n="footer.popular_cities">${_escHtml(f.pop)}</h2>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.services_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.services_title">${_escHtml(f.srv)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.refs_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.refs_title">${_escHtml(f.refs)}</div>`)
            .replace(/<div class="home-footer-subtitle" data-i18n="footer\.share_title">[^<]*<\/div>/,
                `<div class="home-footer-subtitle" data-i18n="footer.share_title">${_escHtml(f.share)}</div>`)
            .replace(/<a href="\/today-hijri-date" data-i18n="footer\.link_hijri_today">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/today-hijri-date" data-i18n="footer.link_hijri_today">${_escHtml(f.l_hijri_today)}</a>`)
            .replace(/<a href="\/hijri-calendar\/1447" data-i18n="footer\.link_hijri_year">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/hijri-calendar/1447" data-i18n="footer.link_hijri_year">${_escHtml(f.l_hijri_year)}</a>`)
            .replace(/<a href="\/dateconverter" data-i18n="footer\.link_date_converter">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/dateconverter" data-i18n="footer.link_date_converter">${_escHtml(f.l_date_conv)}</a>`)
            .replace(/<a href="\/msbaha" data-i18n="footer\.link_tasbih">[^<]*<\/a>/,
                `<a href="${Lf==='ar'?'':'/'+Lf}/msbaha" data-i18n="footer.link_tasbih">${_escHtml(f.l_tasbih)}</a>`)
            .replace(/<p class="home-footer-refs"[\s\S]*?<\/p>/,
                `<p class="home-footer-refs" data-i18n="footer.refs_text">${_escHtml(f.refsText)} <a href="https://ar.wikipedia.org/wiki/%D8%B5%D9%84%D8%A7%D8%A9" target="_blank" rel="noopener external">${_escHtml(f.wikiText)}</a></p>`)
            // Share buttons (Twitter/X, Facebook, WhatsApp, Telegram) — ترجمة نصّ كلّ زرّ
            .replace(/<span data-i18n="footer\.share_x">[^<]*<\/span>/, `<span data-i18n="footer.share_x">${_escHtml(f.x)}</span>`)
            .replace(/<span data-i18n="footer\.share_fb">[^<]*<\/span>/, `<span data-i18n="footer.share_fb">${_escHtml(f.fb)}</span>`)
            .replace(/<span data-i18n="footer\.share_wa">[^<]*<\/span>/, `<span data-i18n="footer.share_wa">${_escHtml(f.wa)}</span>`)
            .replace(/<span data-i18n="footer\.share_tg">[^<]*<\/span>/, `<span data-i18n="footer.share_tg">${_escHtml(f.tg)}</span>`);

        // 5c-aria) SSR لـ aria-label لأزرار المشاركة + مجموعة المشاركة
        const shareAriaI18n = {
            ar: { grp:'مشاركة الموقع', x:'شارك عبر تويتر/X', fb:'شارك عبر فيسبوك', wa:'شارك عبر واتساب', tg:'شارك عبر تلغرام' },
            en: { grp:'Share site', x:'Share on Twitter/X', fb:'Share on Facebook', wa:'Share on WhatsApp', tg:'Share on Telegram' },
            fr: { grp:'Partager le site', x:'Partager sur Twitter/X', fb:'Partager sur Facebook', wa:'Partager sur WhatsApp', tg:'Partager sur Telegram' },
            tr: { grp:'Siteyi paylaş', x:'Twitter/X\'te paylaş', fb:'Facebook\'ta paylaş', wa:'WhatsApp\'ta paylaş', tg:'Telegram\'da paylaş' },
            ur: { grp:'سائٹ شیئر کریں', x:'ٹویٹر/X پر شیئر کریں', fb:'فیس بک پر شیئر کریں', wa:'واٹس ایپ پر شیئر کریں', tg:'ٹیلیگرام پر شیئر کریں' },
            de: { grp:'Seite teilen', x:'Auf Twitter/X teilen', fb:'Auf Facebook teilen', wa:'Auf WhatsApp teilen', tg:'Auf Telegram teilen' },
            id: { grp:'Bagikan situs', x:'Bagikan di Twitter/X', fb:'Bagikan di Facebook', wa:'Bagikan di WhatsApp', tg:'Bagikan di Telegram' },
            es: { grp:'Compartir sitio', x:'Compartir en Twitter/X', fb:'Compartir en Facebook', wa:'Compartir en WhatsApp', tg:'Compartir en Telegram' },
            bn: { grp:'সাইট শেয়ার করুন', x:'টুইটার/X-এ শেয়ার করুন', fb:'ফেসবুকে শেয়ার করুন', wa:'হোয়াটসঅ্যাপে শেয়ার করুন', tg:'টেলিগ্রামে শেয়ার করুন' },
            ms: { grp:'Kongsi laman', x:'Kongsi di Twitter/X', fb:'Kongsi di Facebook', wa:'Kongsi di WhatsApp', tg:'Kongsi di Telegram' },
        };
        const sa = shareAriaI18n[Lf] || shareAriaI18n.ar;
        html = html
            .replace(/<div class="home-share-buttons" role="group" aria-label="[^"]*">/,
                `<div class="home-share-buttons" role="group" aria-label="${_escHtml(sa.grp)}">`)
            .replace(/<a class="home-share-btn" id="share-twitter"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-twitter"$1aria-label="${_escHtml(sa.x)}"`)
            .replace(/<a class="home-share-btn" id="share-facebook"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-facebook"$1aria-label="${_escHtml(sa.fb)}"`)
            .replace(/<a class="home-share-btn" id="share-whatsapp"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-whatsapp"$1aria-label="${_escHtml(sa.wa)}"`)
            .replace(/<a class="home-share-btn" id="share-telegram"([^>]*?)aria-label="[^"]*"/,
                `<a class="home-share-btn" id="share-telegram"$1aria-label="${_escHtml(sa.tg)}"`);

        // 5c-bis) SSR لـ popular-cities-grid (12 مدينة): ترجمة الاسم + prefix للّغة
        const popCityI18n = {
            ar: { mecca:'مكة المكرمة', medina:'المدينة المنورة', riyadh:'الرياض', jeddah:'جدة',
                  cairo:'القاهرة', istanbul:'إسطنبول', dubai:'دبي', amman:'عمّان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'الدار البيضاء', jerusalem:'القدس' },
            en: { mecca:'Mecca', medina:'Medina', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Cairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damascus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            fr: { mecca:'La Mecque', medina:'Médine', riyadh:'Riyad', jeddah:'Djeddah',
                  cairo:'Le Caire', istanbul:'Istanbul', dubai:'Dubaï', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damas', casablanca:'Casablanca', jerusalem:'Jérusalem' },
            tr: { mecca:'Mekke', medina:'Medine', riyadh:'Riyad', jeddah:'Cidde',
                  cairo:'Kahire', istanbul:'İstanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bağdat', damascus:'Şam', casablanca:'Kazablanka', jerusalem:'Kudüs' },
            ur: { mecca:'مکہ مکرمہ', medina:'مدینہ منورہ', riyadh:'ریاض', jeddah:'جدہ',
                  cairo:'قاہرہ', istanbul:'استنبول', dubai:'دبئی', amman:'عمان',
                  baghdad:'بغداد', damascus:'دمشق', casablanca:'کاسابلانکا', jerusalem:'یروشلم' },
            de: { mecca:'Mekka', medina:'Medina', riyadh:'Riad', jeddah:'Dschidda',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Bagdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Jerusalem' },
            id: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kairo', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damaskus', casablanca:'Casablanca', jerusalem:'Yerusalem' },
            es: { mecca:'La Meca', medina:'Medina', riyadh:'Riad', jeddah:'Yeda',
                  cairo:'El Cairo', istanbul:'Estambul', dubai:'Dubái', amman:'Ammán',
                  baghdad:'Bagdad', damascus:'Damasco', casablanca:'Casablanca', jerusalem:'Jerusalén' },
            bn: { mecca:'মক্কা', medina:'মদিনা', riyadh:'রিয়াদ', jeddah:'জেদ্দা',
                  cairo:'কায়রো', istanbul:'ইস্তাম্বুল', dubai:'দুবাই', amman:'আম্মান',
                  baghdad:'বাগদাদ', damascus:'দামেস্ক', casablanca:'কাসাব্লাঙ্কা', jerusalem:'জেরুজালেম' },
            ms: { mecca:'Makkah', medina:'Madinah', riyadh:'Riyadh', jeddah:'Jeddah',
                  cairo:'Kaherah', istanbul:'Istanbul', dubai:'Dubai', amman:'Amman',
                  baghdad:'Baghdad', damascus:'Damsyik', casablanca:'Casablanca', jerusalem:'Baitulmaqdis' },
        };
        const popAriaI18n = {
            ar:'المدن الشائعة', en:'Popular cities', fr:'Villes populaires',
            tr:'Popüler şehirler', ur:'مشہور شہر', de:'Beliebte Städte',
            id:'Kota-kota populer',
            es:'Ciudades populares', bn:'জনপ্রিয় শহর', ms:'Bandar popular',
        };
        const popCities = popCityI18n[Lf] || popCityI18n.ar;
        // قالب "مواقيت الصلاة في {city}" لكلّ لغة (بعض اللغات postfix: tr/ur/bn)
        const prayerTimesInI18n = {
            ar: 'مواقيت الصلاة في {city}',
            en: 'Prayer Times in {city}',
            fr: 'Heures de prière à {city}',
            tr: '{city} için namaz vakitleri',
            ur: '{city} میں اوقاتِ نماز',
            de: 'Gebetszeiten in {city}',
            id: 'Jadwal Sholat di {city}',
            es: 'Horarios de Oración en {city}',
            bn: '{city}-এ নামাজের সময়',
            ms: 'Waktu Solat di {city}',
        };
        const _ptTmpl = prayerTimesInI18n[Lf] || prayerTimesInI18n.ar;
        // 1) ترجمة aria-label
        html = html.replace(
            /<nav class="popular-cities-grid" aria-label="[^"]*">/,
            `<nav class="popular-cities-grid" aria-label="${_escHtml(popAriaI18n[Lf] || popAriaI18n.ar)}">`
        );
        // 2) استبدال النص داخل كل <a href="/prayer-times-in-{slug}">...</a> + إضافة prefix للّغة
        //    النصّ يُصبح "مواقيت الصلاة في {city}" (قالب مترجَم لكلّ لغة) لتحسين SEO.
        html = html.replace(
            /<a href="\/prayer-times-in-(mecca|medina|riyadh|jeddah|cairo|istanbul|dubai|amman|baghdad|damascus|casablanca|jerusalem)">[\s\S]*?<\/a>/g,
            (match, slug) => {
                const name = popCities[slug];
                // اسم المدينة بـ <strong> لإبرازه في الرابط — نُرمِّز جزأَي القالب بشكل منفصل
                // لتفادي تهريب `<strong>`.
                const [pre, post] = _ptTmpl.split('{city}');
                const label = `${_escHtml(pre)}<strong>${_escHtml(name)}</strong>${_escHtml(post)}`;
                const prefix = (Lf === 'ar') ? '' : '/' + Lf;
                return `<a href="${prefix}/prayer-times-in-${slug}">${label}</a>`;
            }
        );
        // 3) ترجمة aria-label للخدمات أيضاً
        const svcAriaI18n = {
            ar:'الخدمات الإسلامية', en:'Islamic services', fr:'Services islamiques',
            tr:'İslami hizmetler', ur:'اسلامی خدمات', de:'Islamische Dienste',
            id:'Layanan Islami',
            es:'Servicios islámicos', bn:'ইসলামিক সেবা', ms:'Perkhidmatan Islam',
        };
        html = html.replace(
            /<nav class="home-services-links" aria-label="[^"]*">/,
            `<nav class="home-services-links" aria-label="${_escHtml(svcAriaI18n[Lf] || svcAriaI18n.ar)}">`
        );

        // 5d) SSR لقسم الدول العربية (العنوان + اسم كل دولة) لكل لغة
        const arabTitleI18n = {
            ar: '🕌 مواقيت الصلاة في الدول العربية',
            en: '🕌 Prayer Times in Arab Countries',
            fr: '🕌 Heures de prière dans les pays arabes',
            tr: '🕌 Arap Ülkelerinde Namaz Vakitleri',
            ur: '🕌 عرب ممالک میں اوقاتِ نماز',
            de: '🕌 Gebetszeiten in arabischen Ländern',
            id: '🕌 Jadwal Sholat di Negara-Negara Arab',
            es: '🕌 Horarios de Oración en Países Árabes',
            bn: '🕌 আরব দেশগুলোতে নামাজের সময়',
            ms: '🕌 Waktu Solat di Negara-Negara Arab',
        };
        const arabCountryI18n = {
            ar: { sa:'السعودية', eg:'مصر', ae:'الإمارات', iq:'العراق', sy:'سوريا',
                  jo:'الأردن', ps:'فلسطين', lb:'لبنان', ye:'اليمن', om:'عُمان',
                  kw:'الكويت', qa:'قطر', bh:'البحرين', ma:'المغرب', dz:'الجزائر',
                  tn:'تونس', ly:'ليبيا', sd:'السودان', mr:'موريتانيا', so:'الصومال',
                  dj:'جيبوتي', km:'جزر القمر' },
            en: { sa:'Saudi Arabia', eg:'Egypt', ae:'UAE', iq:'Iraq', sy:'Syria',
                  jo:'Jordan', ps:'Palestine', lb:'Lebanon', ye:'Yemen', om:'Oman',
                  kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Morocco', dz:'Algeria',
                  tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
                  dj:'Djibouti', km:'Comoros' },
            fr: { sa:'Arabie Saoudite', eg:'Égypte', ae:'Émirats arabes unis', iq:'Irak', sy:'Syrie',
                  jo:'Jordanie', ps:'Palestine', lb:'Liban', ye:'Yémen', om:'Oman',
                  kw:'Koweït', qa:'Qatar', bh:'Bahreïn', ma:'Maroc', dz:'Algérie',
                  tn:'Tunisie', ly:'Libye', sd:'Soudan', mr:'Mauritanie', so:'Somalie',
                  dj:'Djibouti', km:'Comores' },
            tr: { sa:'Suudi Arabistan', eg:'Mısır', ae:'BAE', iq:'Irak', sy:'Suriye',
                  jo:'Ürdün', ps:'Filistin', lb:'Lübnan', ye:'Yemen', om:'Umman',
                  kw:'Kuveyt', qa:'Katar', bh:'Bahreyn', ma:'Fas', dz:'Cezayir',
                  tn:'Tunus', ly:'Libya', sd:'Sudan', mr:'Moritanya', so:'Somali',
                  dj:'Cibuti', km:'Komorlar' },
            ur: { sa:'سعودی عرب', eg:'مصر', ae:'متحدہ عرب امارات', iq:'عراق', sy:'شام',
                  jo:'اردن', ps:'فلسطین', lb:'لبنان', ye:'یمن', om:'عمان',
                  kw:'کویت', qa:'قطر', bh:'بحرین', ma:'مراکش', dz:'الجزائر',
                  tn:'تیونس', ly:'لیبیا', sd:'سوڈان', mr:'موریطانیہ', so:'صومالیہ',
                  dj:'جبوتی', km:'جزائرِ قمر' },
            de: { sa:'Saudi-Arabien', eg:'Ägypten', ae:'Vereinigte Arabische Emirate', iq:'Irak', sy:'Syrien',
                  jo:'Jordanien', ps:'Palästina', lb:'Libanon', ye:'Jemen', om:'Oman',
                  kw:'Kuwait', qa:'Katar', bh:'Bahrain', ma:'Marokko', dz:'Algerien',
                  tn:'Tunesien', ly:'Libyen', sd:'Sudan', mr:'Mauretanien', so:'Somalia',
                  dj:'Dschibuti', km:'Komoren' },
            id: { sa:'Arab Saudi', eg:'Mesir', ae:'Uni Emirat Arab', iq:'Irak', sy:'Suriah',
                  jo:'Yordania', ps:'Palestina', lb:'Lebanon', ye:'Yaman', om:'Oman',
                  kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maroko', dz:'Aljazair',
                  tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
                  dj:'Djibouti', km:'Komoro' },
            es: { sa:'Arabia Saudita', eg:'Egipto', ae:'Emiratos Árabes Unidos', iq:'Irak', sy:'Siria',
                  jo:'Jordania', ps:'Palestina', lb:'Líbano', ye:'Yemen', om:'Omán',
                  kw:'Kuwait', qa:'Catar', bh:'Baréin', ma:'Marruecos', dz:'Argelia',
                  tn:'Túnez', ly:'Libia', sd:'Sudán', mr:'Mauritania', so:'Somalia',
                  dj:'Yibuti', km:'Comoras' },
            bn: { sa:'সৌদি আরব', eg:'মিশর', ae:'সংযুক্ত আরব আমিরাত', iq:'ইরাক', sy:'সিরিয়া',
                  jo:'জর্ডান', ps:'ফিলিস্তিন', lb:'লেবানন', ye:'ইয়েমেন', om:'ওমান',
                  kw:'কুয়েত', qa:'কাতার', bh:'বাহরাইন', ma:'মরক্কো', dz:'আলজেরিয়া',
                  tn:'তিউনিসিয়া', ly:'লিবিয়া', sd:'সুদান', mr:'মৌরিতানিয়া', so:'সোমালিয়া',
                  dj:'জিবুতি', km:'কোমোরোস' },
            ms: { sa:'Arab Saudi', eg:'Mesir', ae:'Emiriah Arab Bersatu', iq:'Iraq', sy:'Syria',
                  jo:'Jordan', ps:'Palestin', lb:'Lubnan', ye:'Yaman', om:'Oman',
                  kw:'Kuwait', qa:'Qatar', bh:'Bahrain', ma:'Maghribi', dz:'Algeria',
                  tn:'Tunisia', ly:'Libya', sd:'Sudan', mr:'Mauritania', so:'Somalia',
                  dj:'Djibouti', km:'Komoros' },
        };
        // أبرز دول العالم (20 دولة من ستّ قارّات) — عنوان القسم بكلّ اللغات
        const worldTitleI18n = {
            ar: '🌍 مواقيت الصلاة في أبرز دول العالم',
            en: '🌍 Prayer Times in Major World Countries',
            fr: '🌍 Heures de prière dans les principaux pays du monde',
            tr: '🌍 Dünyanın Önemli Ülkelerinde Namaz Vakitleri',
            ur: '🌍 دنیا کے نمایاں ممالک میں اوقاتِ نماز',
            de: '🌍 Gebetszeiten in den wichtigsten Ländern der Welt',
            id: '🌍 Jadwal Sholat di Negara-Negara Utama Dunia',
            es: '🌍 Horarios de Oración en los Principales Países del Mundo',
            bn: '🌍 বিশ্বের প্রধান দেশগুলিতে নামাজের সময়',
            ms: '🌍 Waktu Solat di Negara-Negara Utama Dunia',
        };
        // أبرز دول العالم — أسماء 20 دولة مترجَمة لكلّ اللغات العشر
        const worldCountryI18n = {
            ar: { us:'الولايات المتحدة', ca:'كندا', mx:'المكسيك', br:'البرازيل', ar:'الأرجنتين',
                  gb:'المملكة المتحدة', fr:'فرنسا', de:'ألمانيا', es:'إسبانيا', it:'إيطاليا', ru:'روسيا',
                  tr:'تركيا', ir:'إيران', pk:'باكستان', in:'الهند', bd:'بنغلاديش', id:'إندونيسيا', my:'ماليزيا',
                  ng:'نيجيريا', za:'جنوب أفريقيا' },
            en: { us:'United States', ca:'Canada', mx:'Mexico', br:'Brazil', ar:'Argentina',
                  gb:'United Kingdom', fr:'France', de:'Germany', es:'Spain', it:'Italy', ru:'Russia',
                  tr:'Turkey', ir:'Iran', pk:'Pakistan', in:'India', bd:'Bangladesh', id:'Indonesia', my:'Malaysia',
                  ng:'Nigeria', za:'South Africa' },
            fr: { us:'États-Unis', ca:'Canada', mx:'Mexique', br:'Brésil', ar:'Argentine',
                  gb:'Royaume-Uni', fr:'France', de:'Allemagne', es:'Espagne', it:'Italie', ru:'Russie',
                  tr:'Turquie', ir:'Iran', pk:'Pakistan', in:'Inde', bd:'Bangladesh', id:'Indonésie', my:'Malaisie',
                  ng:'Nigeria', za:'Afrique du Sud' },
            tr: { us:'ABD', ca:'Kanada', mx:'Meksika', br:'Brezilya', ar:'Arjantin',
                  gb:'Birleşik Krallık', fr:'Fransa', de:'Almanya', es:'İspanya', it:'İtalya', ru:'Rusya',
                  tr:'Türkiye', ir:'İran', pk:'Pakistan', in:'Hindistan', bd:'Bangladeş', id:'Endonezya', my:'Malezya',
                  ng:'Nijerya', za:'Güney Afrika' },
            ur: { us:'امریکہ', ca:'کینیڈا', mx:'میکسیکو', br:'برازیل', ar:'ارجنٹائن',
                  gb:'برطانیہ', fr:'فرانس', de:'جرمنی', es:'اسپین', it:'اٹلی', ru:'روس',
                  tr:'ترکی', ir:'ایران', pk:'پاکستان', in:'انڈیا', bd:'بنگلہ دیش', id:'انڈونیشیا', my:'ملیشیا',
                  ng:'نائجیریا', za:'جنوبی افریقہ' },
            de: { us:'USA', ca:'Kanada', mx:'Mexiko', br:'Brasilien', ar:'Argentinien',
                  gb:'Vereinigtes Königreich', fr:'Frankreich', de:'Deutschland', es:'Spanien', it:'Italien', ru:'Russland',
                  tr:'Türkei', ir:'Iran', pk:'Pakistan', in:'Indien', bd:'Bangladesch', id:'Indonesien', my:'Malaysia',
                  ng:'Nigeria', za:'Südafrika' },
            id: { us:'Amerika Serikat', ca:'Kanada', mx:'Meksiko', br:'Brasil', ar:'Argentina',
                  gb:'Inggris', fr:'Prancis', de:'Jerman', es:'Spanyol', it:'Italia', ru:'Rusia',
                  tr:'Turki', ir:'Iran', pk:'Pakistan', in:'India', bd:'Bangladesh', id:'Indonesia', my:'Malaysia',
                  ng:'Nigeria', za:'Afrika Selatan' },
            es: { us:'Estados Unidos', ca:'Canadá', mx:'México', br:'Brasil', ar:'Argentina',
                  gb:'Reino Unido', fr:'Francia', de:'Alemania', es:'España', it:'Italia', ru:'Rusia',
                  tr:'Turquía', ir:'Irán', pk:'Pakistán', in:'India', bd:'Bangladés', id:'Indonesia', my:'Malasia',
                  ng:'Nigeria', za:'Sudáfrica' },
            bn: { us:'যুক্তরাষ্ট্র', ca:'কানাডা', mx:'মেক্সিকো', br:'ব্রাজিল', ar:'আর্জেন্টিনা',
                  gb:'যুক্তরাজ্য', fr:'ফ্রান্স', de:'জার্মানি', es:'স্পেন', it:'ইতালি', ru:'রাশিয়া',
                  tr:'তুরস্ক', ir:'ইরান', pk:'পাকিস্তান', in:'ভারত', bd:'বাংলাদেশ', id:'ইন্দোনেশিয়া', my:'মালয়েশিয়া',
                  ng:'নাইজেরিয়া', za:'দক্ষিণ আফ্রিকা' },
            ms: { us:'Amerika Syarikat', ca:'Kanada', mx:'Mexico', br:'Brazil', ar:'Argentina',
                  gb:'United Kingdom', fr:'Perancis', de:'Jerman', es:'Sepanyol', it:'Itali', ru:'Rusia',
                  tr:'Turki', ir:'Iran', pk:'Pakistan', in:'India', bd:'Bangladesh', id:'Indonesia', my:'Malaysia',
                  ng:'Nigeria', za:'Afrika Selatan' },
        };
        if (arabTitleI18n[Lf]) {
            html = html.replace(
                /<h2 id="arab-countries-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="arab-countries-title" data-i18n="footer.arab_countries">${_escHtml(arabTitleI18n[Lf])}</h2>`
            );
        }
        if (worldTitleI18n[Lf]) {
            html = html.replace(
                /<h2 id="world-countries-title"[^>]*>[^<]*<\/h2>/,
                `<h2 id="world-countries-title" class="arab-countries-subtitle" data-i18n="footer.world_countries">${_escHtml(worldTitleI18n[Lf])}</h2>`
            );
        }
        // دمج أسماء الدول العربية + دول العالم لكلّ لغة (الـ regex التالي يمرّ على كلّ <span data-i18n="country.XX"> في الصفحة)
        const names = { ...(arabCountryI18n[Lf] || {}), ...(worldCountryI18n[Lf] || {}) };
        if (names) {
            // نستبدل كل <span data-i18n="country.xx">...</span> بالنص المترجَم
            html = html.replace(
                /<span data-i18n="country\.([a-z]{2})">[^<]*<\/span>/g,
                (match, cc) => names[cc]
                    ? `<span data-i18n="country.${cc}">${_escHtml(names[cc])}</span>`
                    : match
            );
        }
        // SSR للبادئة "مواقيت الصلاة في" داخل بطاقات الدول العربية (لكل لغة)
        const arabPrefixI18n = {
            ar: 'مواقيت الصلاة في ',
            en: 'Prayer Times in ',
            fr: 'Heures de prière à ',
            tr: 'Namaz Vakitleri: ',
            ur: 'اوقاتِ نماز ',
            de: 'Gebetszeiten in ',
            id: 'Jadwal Sholat di ',
            es: 'Horarios de oración en ',
            bn: 'নামাজের সময় ',
            ms: 'Waktu Solat di ',
        };
        const _prefTxt = arabPrefixI18n[Lf] || arabPrefixI18n.ar;
        html = html.replace(
            /<span class="arab-tile-prefix" data-i18n="arab\.prefix">[^<]*<\/span>/g,
            `<span class="arab-tile-prefix" data-i18n="arab.prefix">${_escHtml(_prefTxt)}</span>`
        );

        // 5e) SSR لزر "المزيد" (more-countries-btn): href لكل لغة + نص مترجَم
        const moreBtnI18n = {
            ar: '🌐 استعرض كل دول العالم',
            en: '🌐 Browse all countries worldwide',
            fr: '🌐 Parcourir tous les pays du monde',
            tr: '🌐 Dünyadaki tüm ülkelere göz at',
            ur: '🌐 دنیا کے تمام ممالک دیکھیں',
            de: '🌐 Alle Länder der Welt durchsuchen',
            id: '🌐 Jelajahi semua negara di dunia',
            es: '🌐 Explorar todos los países del mundo',
            bn: '🌐 বিশ্বের সব দেশ দেখুন',
            ms: '🌐 Terokai semua negara di dunia',
        };
        const moreBtnHref = (Lf === 'ar') ? '/prayer-times-worldwide' : `/${Lf}/prayer-times-worldwide`;
        const moreBtnText = moreBtnI18n[Lf] || moreBtnI18n.ar;
        html = html.replace(
            /<a href="\/prayer-times-worldwide" class="more-countries-btn" id="more-countries-btn" data-i18n="countries\.more">[^<]*<\/a>/,
            `<a href="${moreBtnHref}" class="more-countries-btn" id="more-countries-btn" data-i18n="countries.more">${_escHtml(moreBtnText)}</a>`
        );

        // 5f) SSR لروابط country-tile في arab-countries-section:
        //   بالعربية لا prefix، ولباقي اللغات نُضيف /{Lf} لضمان بقاء المستخدم في لغته بعد النقر.
        if (Lf !== 'ar') {
            html = html.replace(
                /<a href="(\/prayer-times-in-[a-z0-9-]+)" class="country-tile"/g,
                `<a href="/${Lf}$1" class="country-tile"`
            );
        }
    }

    const buf = Buffer.from(html, 'utf8');
    const headers = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Vary': 'Accept-Encoding'
    };
    if (acceptEnc.includes('br')) {
        zlib.brotliCompress(buf, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } // سرعة جيدة + ضغط عالي
        }, (e, zbuf) => {
            if (e) { res.writeHead(200, headers); res.end(buf); return; }
            res.writeHead(200, { ...headers, 'Content-Encoding': 'br' });
            res.end(zbuf);
        });
    } else if (acceptEnc.includes('gzip')) {
        zlib.gzip(buf, (e, zbuf) => {
            if (e) { res.writeHead(200, headers); res.end(buf); return; }
            res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
            res.end(zbuf);
        });
    } else {
        res.writeHead(200, headers);
        res.end(buf);
    }
}

// ===== /og-image.svg — dynamic OG image endpoint (1200x630) =====
// Returns SVG as OG image. Accepts ?t=<title>&l=<ar|en>.
function handleOgImage(qs, res) {
    const params = new URLSearchParams(qs);
    const title = (params.get('t') || 'مواقيت الصلاة').slice(0, 110);
    const lang = params.get('l') === 'en' ? 'en' : 'ar';
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';
    const anchor = isAr ? 'end' : 'start';
    const xPos = isAr ? 1140 : 60;
    const subtitle = isAr ? 'مواقيت الصلاة والتاريخ الهجري' : 'Prayer Times & Hijri Calendar';
    const domain = SITE_URL.replace(/^https?:\/\//, '');
    // تقسيم العنوان إلى سطور إذا كان طويلاً
    const words = title.split(' ');
    const lines = [];
    let cur = '';
    const maxChars = isAr ? 30 : 35;
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxChars) { if (cur) lines.push(cur); cur = w; }
        else cur = (cur + ' ' + w).trim();
    }
    if (cur) lines.push(cur);
    const maxLines = lines.slice(0, 3);

    const esc = _escHtml;
    const tspans = maxLines.map((ln, i) =>
        `<tspan x="${xPos}" dy="${i === 0 ? 0 : 86}">${esc(ln)}</tspan>`
    ).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0f6e4a"/>
    <stop offset="1" stop-color="#084a31"/>
  </linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="${isAr ? 160 : 1040}" cy="150" r="70" fill="#ffffff" fill-opacity="0.1"/>
<text x="${isAr ? 160 : 1040}" y="180" text-anchor="middle" font-size="90" fill="#ffffff" fill-opacity="0.95">🕌</text>
<text x="${xPos}" y="260" text-anchor="${anchor}" direction="${dir}" font-family="Cairo, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${tspans}</text>
<text x="${xPos}" y="540" text-anchor="${anchor}" direction="${dir}" font-family="Cairo, Arial, sans-serif" font-size="38" fill="#cde9dc">${esc(subtitle)}</text>
<text x="${xPos}" y="590" text-anchor="${anchor}" direction="${dir}" font-family="Arial, sans-serif" font-size="28" fill="#9dc8b4">${esc(domain)}</text>
</svg>`;
    res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
    });
    res.end(svg);
}

// ===== Rate Limiter متدرّج لـ /api/* =====
// حدود مختلفة حسب تكلفة النقطة — حماية Nominatim دون إزعاج مستخدمي CGNAT
const _rlWindowMs = 60 * 1000;
const _RL_TIERS = {
    cheap:    300,  // /api/cities, /api/cities/add — DB محلي + كاش ذاكرة
    external: 60,   // /api/wiki-* — كاش داخلي 24h/7d
    strict:   30,   // /api/geocode — Nominatim policy (1 req/sec)
};
const _rlMap = new Map(); // ip → { [tier]: { count, resetAt } }
function checkRateLimit(ip, tier) {
    const max = _RL_TIERS[tier] || _RL_TIERS.strict;
    const now = Date.now();
    let buckets = _rlMap.get(ip);
    if (!buckets) { buckets = {}; _rlMap.set(ip, buckets); }
    const entry = buckets[tier];
    if (!entry || now >= entry.resetAt) {
        buckets[tier] = { count: 1, resetAt: now + _rlWindowMs };
        return { allowed: true, max, remaining: max - 1, reset: Math.ceil(_rlWindowMs / 1000) };
    }
    entry.count++;
    if (entry.count > max) {
        return { allowed: false, max, remaining: 0, reset: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { allowed: true, max, remaining: max - entry.count, reset: Math.ceil((entry.resetAt - now) / 1000) };
}
function getTierForPath(urlPath) {
    if (urlPath === '/api/cities' || urlPath === '/api/cities/add') return 'cheap';
    if (urlPath.startsWith('/api/wiki-')) return 'external';
    if (urlPath === '/api/geocode') return 'strict';
    return 'strict'; // أي نقطة مستقبلية غير مصنّفة → الأشد
}
// تنظيف دوري — يزيل IPs التي جميع buckets-ها منتهية (منع نمو غير محدود)
setInterval(() => {
    const now = Date.now();
    for (const [ip, buckets] of _rlMap) {
        let alive = false;
        for (const t in buckets) if (now < buckets[t].resetAt) { alive = true; break; }
        if (!alive) _rlMap.delete(ip);
    }
}, 5 * 60 * 1000).unref();
// ===== Circuit Breaker للخدمات الخارجية =====
// بعد 5 أخطاء متتالية، يتوقف الاستدعاء لدقيقة كاملة — يمنع تكدّس طلبات فاشلة
const _circuits = new Map(); // name → { failures, openUntil }
const _CB_THRESHOLD = 5;
const _CB_COOLDOWN = 60 * 1000;
function circuitAllow(name) {
    const c = _circuits.get(name);
    if (!c) return true;
    if (c.openUntil && Date.now() < c.openUntil) return false;
    return true;
}
function circuitSuccess(name) {
    _circuits.delete(name);
}
function circuitFail(name) {
    const c = _circuits.get(name) || { failures: 0, openUntil: 0 };
    c.failures++;
    if (c.failures >= _CB_THRESHOLD) {
        c.openUntil = Date.now() + _CB_COOLDOWN;
        console.warn(`[CircuitBreaker] ${name} مفتوح حتى ${new Date(c.openUntil).toISOString()}`);
    }
    _circuits.set(name, c);
}

function getClientIp(req) {
    // يدعم وقوف الخادم خلف reverse proxy (Cloudflare/nginx)
    const xff = req.headers['x-forwarded-for'];
    if (xff) return xff.split(',')[0].trim();
    const cf = req.headers['cf-connecting-ip'];
    if (cf) return cf;
    return req.socket.remoteAddress || 'unknown';
}

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.mp3':  'audio/mpeg',
    '.ogg':  'audio/ogg',
    '.wav':  'audio/wav',
    '.txt':  'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
};

// ===== بيانات ثابتة مدمجة للمدن الكبرى =====
const STATIC_CITIES = {
  sa: [
    {nameAr:'الرياض',nameEn:'Riyadh',type:'city',lat:24.6877,lng:46.7219},
    {nameAr:'جدة',nameEn:'Jeddah',type:'city',lat:21.4858,lng:39.1925},
    {nameAr:'مكة المكرمة',nameEn:'Mecca',type:'city',lat:21.3891,lng:39.8579},
    {nameAr:'المدينة المنورة',nameEn:'Medina',type:'city',lat:24.5247,lng:39.5692},
    {nameAr:'الدمام',nameEn:'Dammam',type:'city',lat:26.3927,lng:49.9777},
    {nameAr:'الطائف',nameEn:'Ta\'if',type:'city',lat:21.2854,lng:40.4149},
    {nameAr:'أبها',nameEn:'Abha',type:'city',lat:18.2164,lng:42.5053},
    {nameAr:'تبوك',nameEn:'Tabuk',type:'city',lat:28.3998,lng:36.5701},
    {nameAr:'بريدة',nameEn:'Buraydah',type:'city',lat:26.3592,lng:43.9763},
    {nameAr:'حائل',nameEn:'Ha\'il',type:'city',lat:27.5114,lng:41.7208},
    {nameAr:'الخبر',nameEn:'Al Khobar',type:'city',lat:26.2192,lng:50.1978},
    {nameAr:'نجران',nameEn:'Najran',type:'city',lat:17.5655,lng:44.2276},
    {nameAr:'الجبيل',nameEn:'Al Jubayl',type:'city',lat:27.0174,lng:49.6583},
    {nameAr:'الأحساء',nameEn:'Al Ahsa',type:'city',lat:25.3697,lng:49.5871},
    {nameAr:'القطيف',nameEn:'Al Qatif',type:'city',lat:26.5217,lng:49.9983},
    {nameAr:'ينبع',nameEn:'Yanbu',type:'city',lat:24.0895,lng:38.0618},
    {nameAr:'الدوادمي',nameEn:'Ad Dawadimi',type:'city',lat:24.494,lng:44.3882},
    {nameAr:'عرعر',nameEn:'Arar',type:'city',lat:30.9753,lng:41.0381},
    {nameAr:'الرس',nameEn:'Ar Rass',type:'city',lat:25.8666,lng:43.5103},
    {nameAr:'شقراء',nameEn:'Shaqra',type:'city',lat:25.2318,lng:45.2609},
    {nameAr:'بيشة',nameEn:'Bisha',type:'city',lat:20.0044,lng:42.6035},
    {nameAr:'القريات',nameEn:'Al Qurayyat',type:'city',lat:31.3313,lng:37.3485},
    {nameAr:'الظهران',nameEn:'Dhahran',type:'city',lat:26.3161,lng:50.0747},
    {nameAr:'خميس مشيط',nameEn:'Khamis Mushait',type:'city',lat:18.3063,lng:42.729},
    {nameAr:'الباحة',nameEn:'Al Bahah',type:'city',lat:20.0129,lng:41.4677},
    {nameAr:'صبيا',nameEn:'Sabya',type:'city',lat:17.1528,lng:42.6264},
    {nameAr:'القنفذة',nameEn:'Al Qunfudhah',type:'city',lat:19.1287,lng:41.0793},
    {nameAr:'العيون',nameEn:'Al Oyun',type:'city',lat:26.8527,lng:43.6568},
    {nameAr:'المجمعة',nameEn:'Al Majma\'ah',type:'city',lat:25.8963,lng:45.3562},
    {nameAr:'الخرج',nameEn:'Al Kharj',type:'city',lat:24.1472,lng:47.3133},
    {nameAr:'عنيزة',nameEn:'Unayzah',type:'city',lat:26.0935,lng:43.9993},
    {nameAr:'الليث',nameEn:'Al Lith',type:'city',lat:20.1493,lng:40.2829},
    {nameAr:'القويعية',nameEn:'Al Quway\'iyah',type:'city',lat:24.0655,lng:45.272},
    {nameAr:'جازان',nameEn:'Jizan',type:'city',lat:16.889,lng:42.5512},
    {nameAr:'سكاكا',nameEn:'Sakaka',type:'city',lat:29.9697,lng:40.2048},
    {nameAr:'الوجه',nameEn:'Al Wajh',type:'city',lat:26.2362,lng:36.4601},
    {nameAr:'الزلفي',nameEn:'Az Zulfi',type:'city',lat:26.2938,lng:44.8091},
    {nameAr:'النماص',nameEn:'An Nimas',type:'city',lat:19.1167,lng:42.1294},
    {nameAr:'المثنب',nameEn:'Al Mithnab',type:'city',lat:25.8700,lng:44.2400},
    {nameAr:'رفحاء',nameEn:'Rafha',type:'city',lat:29.6257,lng:43.4866},
    {nameAr:'الهفوف',nameEn:'Al Hofuf',type:'city',lat:25.3662,lng:49.5807},
    {nameAr:'وادي الدواسر',nameEn:'Wadi Al Dawasir',type:'city',lat:20.505,lng:45.1887},
    {nameAr:'محايل عسير',nameEn:'Muhayil',type:'city',lat:18.5617,lng:42.0472},
    {nameAr:'الأفلاج',nameEn:'Al Aflaj',type:'city',lat:22.2763,lng:46.7044},
    {nameAr:'أم القرى',nameEn:'Umm Al Qura',type:'city',lat:21.4225,lng:39.8262},
    {nameAr:'الحوية',nameEn:'Al Hawiyah',type:'city',lat:21.55,lng:41.3},
    {nameAr:'ضباء',nameEn:'Duba',type:'city',lat:27.3584,lng:35.6591},
    {nameAr:'تنومة',nameEn:'Tanumah',type:'city',lat:19.6695,lng:42.3234},
    {nameAr:'الدلم',nameEn:'Ad Dilam',type:'city',lat:23.9926,lng:47.1627},
    {nameAr:'صفوى',nameEn:'Safwa',type:'city',lat:26.6479,lng:49.9979},
  ],
  sy: [
    {nameAr:'دمشق',nameEn:'Damascus',type:'city',lat:33.5102,lng:36.2913},
    {nameAr:'حلب',nameEn:'Aleppo',type:'city',lat:36.2021,lng:37.1343},
    {nameAr:'حمص',nameEn:'Homs',type:'city',lat:34.7324,lng:36.7137},
    {nameAr:'حماة',nameEn:'Hama',type:'city',lat:35.1418,lng:36.7578},
    {nameAr:'اللاذقية',nameEn:'Latakia',type:'city',lat:35.5317,lng:35.7914},
    {nameAr:'دير الزور',nameEn:'Deir ez-Zor',type:'city',lat:35.3352,lng:40.1416},
    {nameAr:'الرقة',nameEn:'Raqqa',type:'city',lat:35.9503,lng:39.0094},
    {nameAr:'السويداء',nameEn:'As-Suwayda',type:'city',lat:32.709,lng:36.5649},
    {nameAr:'درعا',nameEn:'Daraa',type:'city',lat:32.6189,lng:36.1021},
    {nameAr:'القامشلي',nameEn:'Qamishli',type:'city',lat:37.0519,lng:41.2277},
    {nameAr:'إدلب',nameEn:'Idlib',type:'city',lat:35.9311,lng:36.6338},
    {nameAr:'طرطوس',nameEn:'Tartus',type:'city',lat:34.8887,lng:35.8872},
    {nameAr:'بانياس',nameEn:'Baniyas',type:'city',lat:35.1875,lng:35.9417},
    {nameAr:'الحسكة',nameEn:'Al-Hasakah',type:'city',lat:36.5141,lng:40.7453},
    {nameAr:'منبج',nameEn:'Manbij',type:'city',lat:36.5222,lng:37.947},
    {nameAr:'جبلة',nameEn:'Jableh',type:'city',lat:35.3611,lng:35.9242},
    {nameAr:'دومة',nameEn:'Douma',type:'city',lat:33.5731,lng:36.4002},
    {nameAr:'عفرين',nameEn:'Afrin',type:'city',lat:36.5131,lng:36.8686},
    {nameAr:'جرابلس',nameEn:'Jarabulus',type:'city',lat:36.8161,lng:38.0103},
    {nameAr:'تدمر',nameEn:'Palmyra',type:'city',lat:34.5503,lng:38.2674},
    {nameAr:'بصرى الشام',nameEn:'Bosra',type:'city',lat:32.5163,lng:36.4813},
    {nameAr:'صلخد',nameEn:'Salkhad',type:'city',lat:32.4936,lng:36.7131},
  ],
  eg: [
    {nameAr:'القاهرة',nameEn:'Cairo',type:'city',lat:30.0444,lng:31.2357},
    {nameAr:'الإسكندرية',nameEn:'Alexandria',type:'city',lat:31.2001,lng:29.9187},
    {nameAr:'الجيزة',nameEn:'Giza',type:'city',lat:30.0131,lng:31.2089},
    {nameAr:'الإسماعيلية',nameEn:'Ismailia',type:'city',lat:30.5965,lng:32.2715},
    {nameAr:'بورسعيد',nameEn:'Port Said',type:'city',lat:31.2565,lng:32.2841},
    {nameAr:'السويس',nameEn:'Suez',type:'city',lat:29.9668,lng:32.5498},
    {nameAr:'الأقصر',nameEn:'Luxor',type:'city',lat:25.6872,lng:32.6396},
    {nameAr:'أسوان',nameEn:'Aswan',type:'city',lat:24.0889,lng:32.8998},
    {nameAr:'المنصورة',nameEn:'Mansoura',type:'city',lat:31.0364,lng:31.3807},
    {nameAr:'طنطا',nameEn:'Tanta',type:'city',lat:30.7865,lng:31.0004},
    {nameAr:'الزقازيق',nameEn:'Zagazig',type:'city',lat:30.5877,lng:31.5021},
    {nameAr:'دمياط',nameEn:'Damietta',type:'city',lat:31.4165,lng:31.8133},
    {nameAr:'المنيا',nameEn:'Minya',type:'city',lat:28.0871,lng:30.7618},
    {nameAr:'أسيوط',nameEn:'Asyut',type:'city',lat:27.1809,lng:31.1837},
    {nameAr:'سوهاج',nameEn:'Sohag',type:'city',lat:26.559,lng:31.6957},
    {nameAr:'قنا',nameEn:'Qena',type:'city',lat:26.1601,lng:32.7185},
    {nameAr:'الفيوم',nameEn:'Faiyum',type:'city',lat:29.3084,lng:30.8428},
    {nameAr:'بني سويف',nameEn:'Beni Suef',type:'city',lat:29.0661,lng:31.0994},
    {nameAr:'الغردقة',nameEn:'Hurghada',type:'city',lat:27.2574,lng:33.8129},
    {nameAr:'مرسى مطروح',nameEn:'Marsa Matruh',type:'city',lat:31.3543,lng:27.2373},
    {nameAr:'شرم الشيخ',nameEn:'Sharm el-Sheikh',type:'city',lat:27.9158,lng:34.3299},
    {nameAr:'المحلة الكبرى',nameEn:'Mahalla',type:'city',lat:30.9712,lng:31.1653},
    {nameAr:'شبين الكوم',nameEn:'Shibin al-Kawm',type:'city',lat:30.5616,lng:31.0124},
    {nameAr:'كفر الشيخ',nameEn:'Kafr el-Sheikh',type:'city',lat:31.1107,lng:30.9388},
    {nameAr:'بنها',nameEn:'Banha',type:'city',lat:30.4626,lng:31.184},
    {nameAr:'الغربية',nameEn:'Gharbia',type:'city',lat:30.8666,lng:30.9833},
    {nameAr:'دسوق',nameEn:'Desouq',type:'city',lat:31.1283,lng:30.6476},
    {nameAr:'بلبيس',nameEn:'Bilbeis',type:'city',lat:30.4177,lng:31.5619},
    {nameAr:'المنوفية',nameEn:'Monufia',type:'city',lat:30.5975,lng:30.9876},
    {nameAr:'القليوبية',nameEn:'Qalyubia',type:'city',lat:30.3299,lng:31.2168},
  ],
  iq: [
    {nameAr:'بغداد',nameEn:'Baghdad',type:'city',lat:33.3152,lng:44.3661},
    {nameAr:'البصرة',nameEn:'Basra',type:'city',lat:30.5081,lng:47.7835},
    {nameAr:'الموصل',nameEn:'Mosul',type:'city',lat:36.34,lng:43.1333},
    {nameAr:'أربيل',nameEn:'Erbil',type:'city',lat:36.1912,lng:44.0092},
    {nameAr:'السليمانية',nameEn:'Sulaymaniyah',type:'city',lat:35.5572,lng:45.4351},
    {nameAr:'كركوك',nameEn:'Kirkuk',type:'city',lat:35.4681,lng:44.3922},
    {nameAr:'النجف',nameEn:'Najaf',type:'city',lat:32.0081,lng:44.3366},
    {nameAr:'كربلاء',nameEn:'Karbala',type:'city',lat:32.6162,lng:44.0242},
    {nameAr:'الحلة',nameEn:'Al Hillah',type:'city',lat:32.4725,lng:44.4288},
    {nameAr:'الناصرية',nameEn:'Nasiriyah',type:'city',lat:31.0446,lng:46.2577},
    {nameAr:'العمارة',nameEn:'Al Amarah',type:'city',lat:31.839,lng:47.1481},
    {nameAr:'الكوت',nameEn:'Al Kut',type:'city',lat:32.5,lng:45.8319},
    {nameAr:'الرمادي',nameEn:'Ramadi',type:'city',lat:33.4244,lng:43.299},
    {nameAr:'الفلوجة',nameEn:'Fallujah',type:'city',lat:33.3572,lng:43.7796},
    {nameAr:'تكريت',nameEn:'Tikrit',type:'city',lat:34.5965,lng:43.6812},
    {nameAr:'سامراء',nameEn:'Samarra',type:'city',lat:34.2015,lng:43.8756},
    {nameAr:'الديوانية',nameEn:'Al Diwaniyah',type:'city',lat:31.9888,lng:44.9246},
    {nameAr:'دهوك',nameEn:'Dohuk',type:'city',lat:36.8674,lng:42.9946},
    {nameAr:'بعقوبة',nameEn:'Baqubah',type:'city',lat:33.7467,lng:44.6532},
    {nameAr:'زاخو',nameEn:'Zakho',type:'city',lat:37.1444,lng:42.6839},
    {nameAr:'الحي',nameEn:'Al Hayy',type:'city',lat:32.1746,lng:46.0448},
    {nameAr:'العزيزية',nameEn:'Al Aziziyah',type:'city',lat:32.9098,lng:45.0665},
    {nameAr:'النخيب',nameEn:'Al Nukhayb',type:'city',lat:32.0333,lng:42.2667},
  ],
  jo: [
    {nameAr:'عمّان',nameEn:'Amman',type:'city',lat:31.9539,lng:35.9106},
    {nameAr:'الزرقاء',nameEn:'Zarqa',type:'city',lat:32.0728,lng:36.0879},
    {nameAr:'إربد',nameEn:'Irbid',type:'city',lat:32.5568,lng:35.8469},
    {nameAr:'العقبة',nameEn:'Aqaba',type:'city',lat:29.5321,lng:35.0062},
    {nameAr:'السلط',nameEn:'As-Salt',type:'city',lat:32.0392,lng:35.727},
    {nameAr:'مادبا',nameEn:'Madaba',type:'city',lat:31.7167,lng:35.8},
    {nameAr:'الكرك',nameEn:'Al Karak',type:'city',lat:31.1797,lng:35.7047},
    {nameAr:'المفرق',nameEn:'Mafraq',type:'city',lat:32.3418,lng:36.2024},
    {nameAr:'جرش',nameEn:'Jerash',type:'city',lat:32.2764,lng:35.8969},
    {nameAr:'عجلون',nameEn:'Ajloun',type:'city',lat:32.3338,lng:35.7508},
    {nameAr:'معان',nameEn:'Ma\'an',type:'city',lat:30.1942,lng:35.7347},
    {nameAr:'الطفيلة',nameEn:'Tafilah',type:'city',lat:30.8337,lng:35.6043},
    {nameAr:'رصيفة',nameEn:'Russeifa',type:'city',lat:32.0163,lng:36.0615},
    {nameAr:'الرمثا',nameEn:'Ramtha',type:'city',lat:32.5683,lng:35.9994},
    {nameAr:'الحسين',nameEn:'Al Hussein',type:'city',lat:31.5,lng:35.95},
  ],
  lb: [
    {nameAr:'بيروت',nameEn:'Beirut',type:'city',lat:33.8869,lng:35.5131},
    {nameAr:'طرابلس',nameEn:'Tripoli',type:'city',lat:34.4367,lng:35.8497},
    {nameAr:'صيدا',nameEn:'Sidon',type:'city',lat:33.5631,lng:35.3714},
    {nameAr:'صور',nameEn:'Tyre',type:'city',lat:33.2705,lng:35.2037},
    {nameAr:'زحلة',nameEn:'Zahlé',type:'city',lat:33.8467,lng:35.9018},
    {nameAr:'جونية',nameEn:'Jounieh',type:'city',lat:33.9808,lng:35.6178},
    {nameAr:'النبطية',nameEn:'Nabatieh',type:'city',lat:33.3772,lng:35.4839},
    {nameAr:'بعلبك',nameEn:'Baalbek',type:'city',lat:34.0046,lng:36.2109},
    {nameAr:'حلبا',nameEn:'Halba',type:'city',lat:34.5487,lng:36.0785},
    {nameAr:'بنت جبيل',nameEn:'Bint Jbeil',type:'city',lat:33.1181,lng:35.4311},
    {nameAr:'جبيل',nameEn:'Byblos',type:'city',lat:34.1235,lng:35.6488},
    {nameAr:'عاليه',nameEn:'Aley',type:'city',lat:33.8103,lng:35.5986},
    {nameAr:'دير القمر',nameEn:'Deir el Qamar',type:'city',lat:33.6912,lng:35.5798},
  ],
  ae: [
    {nameAr:'دبي',nameEn:'Dubai',type:'city',lat:25.2048,lng:55.2708},
    {nameAr:'أبوظبي',nameEn:'Abu Dhabi',type:'city',lat:24.4539,lng:54.3773},
    {nameAr:'الشارقة',nameEn:'Sharjah',type:'city',lat:25.3463,lng:55.4209},
    {nameAr:'عجمان',nameEn:'Ajman',type:'city',lat:25.4052,lng:55.5136},
    {nameAr:'رأس الخيمة',nameEn:'Ras Al Khaimah',type:'city',lat:25.7895,lng:55.9432},
    {nameAr:'الفجيرة',nameEn:'Fujairah',type:'city',lat:25.1288,lng:56.3265},
    {nameAr:'أم القيوين',nameEn:'Umm Al Quwain',type:'city',lat:25.5647,lng:55.5553},
    {nameAr:'العين',nameEn:'Al Ain',type:'city',lat:24.2075,lng:55.7447},
    {nameAr:'خور فكان',nameEn:'Khor Fakkan',type:'city',lat:25.3318,lng:56.3437},
    {nameAr:'دبا الفجيرة',nameEn:'Dibba',type:'city',lat:25.6186,lng:56.2661},
    {nameAr:'الظيد',nameEn:'Al Dhaid',type:'city',lat:25.2887,lng:55.8763},
    {nameAr:'مدينة زايد',nameEn:'Madinat Zayed',type:'city',lat:23.6567,lng:53.7074},
  ],
  kw: [
    {nameAr:'الكويت',nameEn:'Kuwait City',type:'city',lat:29.3697,lng:47.9783},
    {nameAr:'الجهراء',nameEn:'Al Jahra',type:'city',lat:29.3373,lng:47.6578},
    {nameAr:'الأحمدي',nameEn:'Al Ahmadi',type:'city',lat:29.0769,lng:48.0839},
    {nameAr:'الفروانية',nameEn:'Al Farwaniyah',type:'city',lat:29.2769,lng:47.9534},
    {nameAr:'حولي',nameEn:'Hawalli',type:'city',lat:29.3327,lng:48.0323},
    {nameAr:'مبارك الكبير',nameEn:'Mubarak Al-Kabeer',type:'city',lat:29.2074,lng:48.0591},
    {nameAr:'السالمية',nameEn:'Salmiya',type:'city',lat:29.3345,lng:48.0741},
    {nameAr:'الرميثية',nameEn:'Rumaithiya',type:'city',lat:29.3253,lng:48.0856},
    {nameAr:'صباح السالم',nameEn:'Sabah Al Salem',type:'city',lat:29.2611,lng:48.0664},
  ],
  qa: [
    {nameAr:'الدوحة',nameEn:'Doha',type:'city',lat:25.2854,lng:51.531},
    {nameAr:'الريان',nameEn:'Al Rayyan',type:'city',lat:25.2919,lng:51.4243},
    {nameAr:'الوكرة',nameEn:'Al Wakrah',type:'city',lat:25.1664,lng:51.6084},
    {nameAr:'الخور',nameEn:'Al Khor',type:'city',lat:25.6833,lng:51.5},
    {nameAr:'مسيعيد',nameEn:'Mesaieed',type:'city',lat:24.9951,lng:51.5593},
    {nameAr:'الشحانية',nameEn:'Al Shahaniya',type:'city',lat:25.4167,lng:51.2167},
    {nameAr:'الجميلية',nameEn:'Al Jumaliyah',type:'city',lat:25.6297,lng:51.084},
    {nameAr:'دخان',nameEn:'Dukhan',type:'city',lat:25.4233,lng:50.7804},
  ],
  bh: [
    {nameAr:'المنامة',nameEn:'Manama',type:'city',lat:26.215,lng:50.5832},
    {nameAr:'المحرق',nameEn:'Muharraq',type:'city',lat:26.2468,lng:50.6098},
    {nameAr:'الرفاع',nameEn:'Riffa',type:'city',lat:26.13,lng:50.555},
    {nameAr:'مدينة حمد',nameEn:'Hamad Town',type:'city',lat:26.1121,lng:50.5078},
    {nameAr:'مدينة عيسى',nameEn:'Isa Town',type:'city',lat:26.1734,lng:50.5481},
    {nameAr:'سترة',nameEn:'Sitra',type:'city',lat:26.1568,lng:50.6228},
    {nameAr:'جدحفص',nameEn:'Jidhafs',type:'city',lat:26.2127,lng:50.5394},
    {nameAr:'الجفير',nameEn:'Juffair',type:'city',lat:26.2196,lng:50.5945},
  ],
  om: [
    {nameAr:'مسقط',nameEn:'Muscat',type:'city',lat:23.5957,lng:58.5933},
    {nameAr:'صلالة',nameEn:'Salalah',type:'city',lat:17.0159,lng:54.0924},
    {nameAr:'نزوى',nameEn:'Nizwa',type:'city',lat:22.9333,lng:57.5333},
    {nameAr:'صحار',nameEn:'Sohar',type:'city',lat:24.3429,lng:56.7456},
    {nameAr:'السيب',nameEn:'Seeb',type:'city',lat:23.6693,lng:58.1722},
    {nameAr:'صور',nameEn:'Sur',type:'city',lat:22.5668,lng:59.5289},
    {nameAr:'عبري',nameEn:'Ibri',type:'city',lat:23.2255,lng:56.5128},
    {nameAr:'بهلاء',nameEn:'Bahla',type:'city',lat:22.9645,lng:57.2948},
    {nameAr:'الرستاق',nameEn:'Rustaq',type:'city',lat:23.3919,lng:57.4266},
    {nameAr:'خصب',nameEn:'Khasab',type:'city',lat:26.1891,lng:56.2395},
    {nameAr:'إبراء',nameEn:'Ibra',type:'city',lat:22.6909,lng:58.5357},
    {nameAr:'عمان',nameEn:'Oman',type:'city',lat:21.4735,lng:55.9754},
    {nameAr:'ثمريت',nameEn:'Thumrayt',type:'city',lat:17.6625,lng:54.0285},
    {nameAr:'بركاء',nameEn:'Barka',type:'city',lat:23.6752,lng:57.8901},
    {nameAr:'مطرح',nameEn:'Mutrah',type:'city',lat:23.6191,lng:58.5927},
  ],
  ye: [
    {nameAr:'صنعاء',nameEn:'Sanaa',type:'city',lat:15.3694,lng:44.191},
    {nameAr:'عدن',nameEn:'Aden',type:'city',lat:12.7797,lng:45.0095},
    {nameAr:'تعز',nameEn:'Taiz',type:'city',lat:13.5795,lng:44.0177},
    {nameAr:'الحديدة',nameEn:'Hudaydah',type:'city',lat:14.7978,lng:42.9544},
    {nameAr:'إب',nameEn:'Ibb',type:'city',lat:13.9747,lng:44.1833},
    {nameAr:'مأرب',nameEn:'Marib',type:'city',lat:15.4669,lng:45.3226},
    {nameAr:'ذمار',nameEn:'Dhamar',type:'city',lat:14.5425,lng:44.4041},
    {nameAr:'حجة',nameEn:'Hajjah',type:'city',lat:15.6931,lng:43.5978},
    {nameAr:'المكلا',nameEn:'Mukalla',type:'city',lat:14.5324,lng:49.1247},
    {nameAr:'سيئون',nameEn:'Seiyun',type:'city',lat:15.9426,lng:48.7883},
    {nameAr:'صعدة',nameEn:'Saada',type:'city',lat:16.935,lng:43.7612},
    {nameAr:'الضالع',nameEn:'Daleh',type:'city',lat:13.6957,lng:44.7317},
    {nameAr:'البيضاء',nameEn:'Al Bayda',type:'city',lat:14.0004,lng:45.5727},
    {nameAr:'المنصورة',nameEn:'Al Mansura',type:'city',lat:12.8221,lng:44.9969},
    {nameAr:'شبوة',nameEn:'Shabwah',type:'city',lat:14.5333,lng:47.05},
    {nameAr:'أبين',nameEn:'Abyan',type:'city',lat:13.3617,lng:45.3733},
    {nameAr:'لحج',nameEn:'Lahij',type:'city',lat:13.0588,lng:44.8811},
    {nameAr:'ريدة',nameEn:'Rida',type:'city',lat:15.8667,lng:44.0333},
  ],
  ly: [
    {nameAr:'طرابلس',nameEn:'Tripoli',type:'city',lat:32.8872,lng:13.1913},
    {nameAr:'بنغازي',nameEn:'Benghazi',type:'city',lat:32.1167,lng:20.0667},
    {nameAr:'مصراتة',nameEn:'Misrata',type:'city',lat:32.3754,lng:15.0925},
    {nameAr:'الزاوية',nameEn:'Zawiya',type:'city',lat:32.7522,lng:12.7279},
    {nameAr:'البيضاء',nameEn:'Al Bayda',type:'city',lat:32.7636,lng:21.7553},
    {nameAr:'سبها',nameEn:'Sabha',type:'city',lat:27.0369,lng:14.4289},
    {nameAr:'أجدابيا',nameEn:'Ajdabiya',type:'city',lat:30.7554,lng:20.2264},
    {nameAr:'الخمس',nameEn:'Al Khums',type:'city',lat:32.6486,lng:14.2619},
    {nameAr:'ترهونة',nameEn:'Tarhuna',type:'city',lat:32.4346,lng:13.6367},
    {nameAr:'غريان',nameEn:'Gharyan',type:'city',lat:32.1724,lng:13.0201},
    {nameAr:'زليتن',nameEn:'Zliten',type:'city',lat:32.4674,lng:14.5688},
    {nameAr:'توكرة',nameEn:'Tocra',type:'city',lat:32.5323,lng:20.5823},
    {nameAr:'سرت',nameEn:'Sirte',type:'city',lat:31.2089,lng:16.5887},
    {nameAr:'درنة',nameEn:'Derna',type:'city',lat:32.7668,lng:22.6335},
    {nameAr:'مرزق',nameEn:'Murzuq',type:'city',lat:25.9167,lng:13.9167},
    {nameAr:'غدامس',nameEn:'Ghadames',type:'city',lat:30.1333,lng:9.5},
  ],
  tn: [
    {nameAr:'تونس',nameEn:'Tunis',type:'city',lat:36.8065,lng:10.1815},
    {nameAr:'صفاقس',nameEn:'Sfax',type:'city',lat:34.7406,lng:10.7603},
    {nameAr:'سوسة',nameEn:'Sousse',type:'city',lat:35.8245,lng:10.638},
    {nameAr:'القيروان',nameEn:'Kairouan',type:'city',lat:35.6781,lng:10.0963},
    {nameAr:'بنزرت',nameEn:'Bizerte',type:'city',lat:37.2744,lng:9.8739},
    {nameAr:'قابس',nameEn:'Gabes',type:'city',lat:33.8882,lng:10.0975},
    {nameAr:'المنستير',nameEn:'Monastir',type:'city',lat:35.7643,lng:10.8113},
    {nameAr:'قفصة',nameEn:'Gafsa',type:'city',lat:34.425,lng:8.7842},
    {nameAr:'المهدية',nameEn:'Mahdia',type:'city',lat:35.5047,lng:11.0622},
    {nameAr:'تطاوين',nameEn:'Tataouine',type:'city',lat:32.9297,lng:10.4518},
    {nameAr:'قبلي',nameEn:'Kebili',type:'city',lat:33.7053,lng:8.9726},
    {nameAr:'نابل',nameEn:'Nabeul',type:'city',lat:36.4513,lng:10.7352},
    {nameAr:'زغوان',nameEn:'Zaghouan',type:'city',lat:36.4028,lng:10.1433},
    {nameAr:'سليانة',nameEn:'Siliana',type:'city',lat:36.0848,lng:9.3696},
    {nameAr:'الكاف',nameEn:'Kef',type:'city',lat:36.1741,lng:8.7108},
    {nameAr:'جندوبة',nameEn:'Jendouba',type:'city',lat:36.5011,lng:8.7803},
    {nameAr:'باجة',nameEn:'Beja',type:'city',lat:36.7333,lng:9.1833},
    {nameAr:'أريانة',nameEn:'Ariana',type:'city',lat:36.8625,lng:10.1956},
    {nameAr:'مدنين',nameEn:'Medenine',type:'city',lat:33.3547,lng:10.5053},
    {nameAr:'قرقنة',nameEn:'Kerkennah',type:'city',lat:34.7167,lng:11.1833},
  ],
  dz: [
    {nameAr:'الجزائر العاصمة',nameEn:'Algiers',type:'city',lat:36.7372,lng:3.0865},
    {nameAr:'وهران',nameEn:'Oran',type:'city',lat:35.6969,lng:-0.6331},
    {nameAr:'قسنطينة',nameEn:'Constantine',type:'city',lat:36.365,lng:6.6147},
    {nameAr:'عنابة',nameEn:'Annaba',type:'city',lat:36.9,lng:7.7667},
    {nameAr:'بجاية',nameEn:'Bejaia',type:'city',lat:36.7519,lng:5.0567},
    {nameAr:'تلمسان',nameEn:'Tlemcen',type:'city',lat:34.8828,lng:-1.3153},
    {nameAr:'سطيف',nameEn:'Setif',type:'city',lat:36.1898,lng:5.4108},
    {nameAr:'بسكرة',nameEn:'Biskra',type:'city',lat:34.8503,lng:5.7287},
    {nameAr:'تيزي وزو',nameEn:'Tizi Ouzou',type:'city',lat:36.7169,lng:4.0497},
    {nameAr:'البليدة',nameEn:'Blida',type:'city',lat:36.4703,lng:2.8277},
    {nameAr:'سكيكدة',nameEn:'Skikda',type:'city',lat:36.8761,lng:6.9044},
    {nameAr:'المسيلة',nameEn:'M\'Sila',type:'city',lat:35.7058,lng:4.5439},
    {nameAr:'تيارت',nameEn:'Tiaret',type:'city',lat:35.3706,lng:1.3178},
    {nameAr:'تبسة',nameEn:'Tebessa',type:'city',lat:35.4042,lng:8.1208},
    {nameAr:'جيجل',nameEn:'Jijel',type:'city',lat:36.8167,lng:5.7667},
    {nameAr:'مستغانم',nameEn:'Mostaganem',type:'city',lat:35.9311,lng:0.0894},
    {nameAr:'برج بوعريريج',nameEn:'Bordj Bou Arreridj',type:'city',lat:36.0731,lng:4.7633},
    {nameAr:'باتنة',nameEn:'Batna',type:'city',lat:35.5554,lng:6.1743},
    {nameAr:'الأغواط',nameEn:'Laghouat',type:'city',lat:33.8005,lng:2.8651},
    {nameAr:'الجلفة',nameEn:'Djelfa',type:'city',lat:34.6733,lng:3.2633},
    {nameAr:'غرداية',nameEn:'Ghardaïa',type:'city',lat:32.4903,lng:3.6739},
    {nameAr:'أدرار',nameEn:'Adrar',type:'city',lat:27.8742,lng:-0.2944},
    {nameAr:'تمنراست',nameEn:'Tamanrasset',type:'city',lat:22.785,lng:5.5228},
    {nameAr:'بومرداس',nameEn:'Boumerdes',type:'city',lat:36.7667,lng:3.4772},
    {nameAr:'الشلف',nameEn:'Chlef',type:'city',lat:36.1649,lng:1.3317},
  ],
  ma: [
    {nameAr:'الرباط',nameEn:'Rabat',type:'city',lat:34.0209,lng:-6.8417},
    {nameAr:'الدار البيضاء',nameEn:'Casablanca',type:'city',lat:33.5731,lng:-7.5898},
    {nameAr:'فاس',nameEn:'Fes',type:'city',lat:34.0333,lng:-5.0},
    {nameAr:'مراكش',nameEn:'Marrakech',type:'city',lat:31.6295,lng:-7.9811},
    {nameAr:'مكناس',nameEn:'Meknes',type:'city',lat:33.8935,lng:-5.5473},
    {nameAr:'طنجة',nameEn:'Tangier',type:'city',lat:35.7595,lng:-5.834},
    {nameAr:'أكادير',nameEn:'Agadir',type:'city',lat:30.4278,lng:-9.5981},
    {nameAr:'وجدة',nameEn:'Oujda',type:'city',lat:34.6814,lng:-1.9086},
    {nameAr:'القنيطرة',nameEn:'Kenitra',type:'city',lat:34.261,lng:-6.5802},
    {nameAr:'تطوان',nameEn:'Tetouan',type:'city',lat:35.5785,lng:-5.3684},
    {nameAr:'سلا',nameEn:'Sale',type:'city',lat:34.0531,lng:-6.7985},
    {nameAr:'سطات',nameEn:'Settat',type:'city',lat:33.0,lng:-7.6167},
    {nameAr:'الجديدة',nameEn:'El Jadida',type:'city',lat:33.2316,lng:-8.5007},
    {nameAr:'خريبكة',nameEn:'Khouribga',type:'city',lat:32.8811,lng:-6.9063},
    {nameAr:'الناظور',nameEn:'Nador',type:'city',lat:35.1741,lng:-2.9287},
    {nameAr:'بني ملال',nameEn:'Beni Mellal',type:'city',lat:32.3373,lng:-6.3498},
    {nameAr:'تازة',nameEn:'Taza',type:'city',lat:34.2155,lng:-4.0104},
    {nameAr:'الحسيمة',nameEn:'Al Hoceima',type:'city',lat:35.2517,lng:-3.9372},
    {nameAr:'آسفي',nameEn:'Safi',type:'city',lat:32.2994,lng:-9.2372},
    {nameAr:'ورزازات',nameEn:'Ouarzazate',type:'city',lat:30.9335,lng:-6.9370},
    {nameAr:'العرائش',nameEn:'Larache',type:'city',lat:35.1932,lng:-6.1561},
    {nameAr:'برشيد',nameEn:'Berrechid',type:'city',lat:33.2655,lng:-7.5884},
    {nameAr:'القصر الكبير',nameEn:'Ksar el-Kebir',type:'city',lat:35.0002,lng:-5.9014},
    {nameAr:'المحمدية',nameEn:'Mohammedia',type:'city',lat:33.6861,lng:-7.3828},
    {nameAr:'إفران',nameEn:'Ifrane',type:'city',lat:33.5228,lng:-5.1073},
  ],
  sd: [
    {nameAr:'الخرطوم',nameEn:'Khartoum',type:'city',lat:15.5007,lng:32.5599},
    {nameAr:'أم درمان',nameEn:'Omdurman',type:'city',lat:15.6445,lng:32.4777},
    {nameAr:'بورتسودان',nameEn:'Port Sudan',type:'city',lat:19.6158,lng:37.2164},
    {nameAr:'كسلا',nameEn:'Kassala',type:'city',lat:15.4517,lng:36.4},
    {nameAr:'الأبيض',nameEn:'Al-Ubayyid',type:'city',lat:13.1833,lng:30.2167},
    {nameAr:'نيالا',nameEn:'Nyala',type:'city',lat:12.0489,lng:24.8878},
    {nameAr:'عطبرة',nameEn:'Atbara',type:'city',lat:17.7,lng:33.9833},
    {nameAr:'الفاشر',nameEn:'El Fasher',type:'city',lat:13.6286,lng:25.3511},
    {nameAr:'مدني',nameEn:'Medani',type:'city',lat:14.3836,lng:33.4882},
    {nameAr:'الدمازين',nameEn:'Ad Damazin',type:'city',lat:11.7900,lng:34.3600},
    {nameAr:'سنار',nameEn:'Sennar',type:'city',lat:13.5500,lng:33.6333},
    {nameAr:'ربك',nameEn:'Rabak',type:'city',lat:13.1780,lng:32.7417},
    {nameAr:'القضارف',nameEn:'Al Qadarif',type:'city',lat:14.0439,lng:35.3863},
    {nameAr:'زالنجي',nameEn:'Zalingei',type:'city',lat:12.9068,lng:23.4706},
  ],
  ps: [
    {nameAr:'القدس',nameEn:'Jerusalem',type:'city',lat:31.7683,lng:35.2137},
    {nameAr:'غزة',nameEn:'Gaza',type:'city',lat:31.5017,lng:34.4668},
    {nameAr:'الضفة الغربية',nameEn:'West Bank',type:'city',lat:32.0,lng:35.25},
    {nameAr:'نابلس',nameEn:'Nablus',type:'city',lat:32.2211,lng:35.2544},
    {nameAr:'رام الله',nameEn:'Ramallah',type:'city',lat:31.8996,lng:35.2042},
    {nameAr:'الخليل',nameEn:'Hebron',type:'city',lat:31.5326,lng:35.0998},
    {nameAr:'جنين',nameEn:'Jenin',type:'city',lat:32.4597,lng:35.2979},
    {nameAr:'طولكرم',nameEn:'Tulkarm',type:'city',lat:32.3104,lng:35.0285},
    {nameAr:'أريحا',nameEn:'Jericho',type:'city',lat:31.8613,lng:35.4447},
    {nameAr:'بيت لحم',nameEn:'Bethlehem',type:'city',lat:31.7054,lng:35.2024},
    {nameAr:'خان يونس',nameEn:'Khan Yunis',type:'city',lat:31.3449,lng:34.3068},
    {nameAr:'رفح',nameEn:'Rafah',type:'city',lat:31.2826,lng:34.2547},
    {nameAr:'قلقيلية',nameEn:'Qalqilya',type:'city',lat:32.1865,lng:34.9754},
    {nameAr:'سلفيت',nameEn:'Salfit',type:'city',lat:32.0847,lng:35.1779},
    {nameAr:'طوباس',nameEn:'Tubas',type:'city',lat:32.3209,lng:35.3693},
    {nameAr:'أريحا',nameEn:'Jericho',type:'city',lat:31.8567,lng:35.4631},
  ],
  pk: [
    {nameAr:'كراتشي',nameEn:'Karachi',type:'city',lat:24.8607,lng:67.0011},
    {nameAr:'لاهور',nameEn:'Lahore',type:'city',lat:31.5204,lng:74.3587},
    {nameAr:'إسلام آباد',nameEn:'Islamabad',type:'city',lat:33.6844,lng:73.0479},
    {nameAr:'فيصل آباد',nameEn:'Faisalabad',type:'city',lat:31.4504,lng:73.135},
    {nameAr:'راولبندي',nameEn:'Rawalpindi',type:'city',lat:33.5651,lng:73.0169},
    {nameAr:'ملتان',nameEn:'Multan',type:'city',lat:30.1575,lng:71.5249},
    {nameAr:'حيدر آباد',nameEn:'Hyderabad',type:'city',lat:25.3792,lng:68.3683},
    {nameAr:'كيتا',nameEn:'Quetta',type:'city',lat:30.1798,lng:66.975},
    {nameAr:'بيشاور',nameEn:'Peshawar',type:'city',lat:34.0,lng:71.5},
    {nameAr:'غوجرانوالا',nameEn:'Gujranwala',type:'city',lat:32.1877,lng:74.1945},
    {nameAr:'سيالكوت',nameEn:'Sialkot',type:'city',lat:32.4945,lng:74.5229},
    {nameAr:'سرغودا',nameEn:'Sargodha',type:'city',lat:32.0836,lng:72.6711},
    {nameAr:'بهاولبور',nameEn:'Bahawalpur',type:'city',lat:29.3956,lng:71.6722},
    {nameAr:'سكهر',nameEn:'Sukkur',type:'city',lat:27.7052,lng:68.8574},
    {nameAr:'شيخوبورة',nameEn:'Sheikhupura',type:'city',lat:31.7131,lng:73.9853},
  ],
  tr: [
    {nameAr:'إسطنبول',nameEn:'Istanbul',type:'city',lat:41.0082,lng:28.9784},
    {nameAr:'أنقرة',nameEn:'Ankara',type:'city',lat:39.9334,lng:32.8597},
    {nameAr:'إزمير',nameEn:'Izmir',type:'city',lat:38.4192,lng:27.1287},
    {nameAr:'أنطاليا',nameEn:'Antalya',type:'city',lat:36.8969,lng:30.7133},
    {nameAr:'أضنة',nameEn:'Adana',type:'city',lat:37.0,lng:35.3213},
    {nameAr:'بورصة',nameEn:'Bursa',type:'city',lat:40.1885,lng:29.061},
    {nameAr:'طرابزون',nameEn:'Trabzon',type:'city',lat:41.005,lng:39.7239},
    {nameAr:'كونيا',nameEn:'Konya',type:'city',lat:37.871,lng:32.4932},
    {nameAr:'غازي عنتاب',nameEn:'Gaziantep',type:'city',lat:37.0662,lng:37.3833},
    {nameAr:'مرسين',nameEn:'Mersin',type:'city',lat:36.8,lng:34.6333},
    {nameAr:'قيصري',nameEn:'Kayseri',type:'city',lat:38.7225,lng:35.4875},
    {nameAr:'إسكندرونة',nameEn:'Iskenderun',type:'city',lat:36.5853,lng:36.1667},
    {nameAr:'ديار بكر',nameEn:'Diyarbakir',type:'city',lat:37.9144,lng:40.2306},
    {nameAr:'أورفة',nameEn:'Urfa',type:'city',lat:37.1591,lng:38.7969},
    {nameAr:'ملاطية',nameEn:'Malatya',type:'city',lat:38.3552,lng:38.3095},
    {nameAr:'إسكيشهير',nameEn:'Eskisehir',type:'city',lat:39.7767,lng:30.5206},
    {nameAr:'طرسوس',nameEn:'Tarsus',type:'city',lat:36.9163,lng:34.8956},
    {nameAr:'سامسون',nameEn:'Samsun',type:'city',lat:41.2867,lng:36.33},
  ],
  ir: [
    {nameAr:'طهران',nameEn:'Tehran',type:'city',lat:35.6892,lng:51.389},
    {nameAr:'مشهد',nameEn:'Mashhad',type:'city',lat:36.2972,lng:59.6067},
    {nameAr:'أصفهان',nameEn:'Isfahan',type:'city',lat:32.6539,lng:51.6661},
    {nameAr:'شيراز',nameEn:'Shiraz',type:'city',lat:29.5918,lng:52.5837},
    {nameAr:'تبريز',nameEn:'Tabriz',type:'city',lat:38.08,lng:46.2919},
    {nameAr:'كرج',nameEn:'Karaj',type:'city',lat:35.8325,lng:50.9993},
    {nameAr:'أهواز',nameEn:'Ahvaz',type:'city',lat:31.3183,lng:48.6706},
    {nameAr:'قم',nameEn:'Qom',type:'city',lat:34.6401,lng:50.8764},
    {nameAr:'كرمانشاه',nameEn:'Kermanshah',type:'city',lat:34.3142,lng:47.065},
    {nameAr:'أورمية',nameEn:'Urmia',type:'city',lat:37.5527,lng:45.0761},
    {nameAr:'زاهدان',nameEn:'Zahedan',type:'city',lat:29.4964,lng:60.8629},
    {nameAr:'رشت',nameEn:'Rasht',type:'city',lat:37.2808,lng:49.5832},
    {nameAr:'كرمان',nameEn:'Kerman',type:'city',lat:30.2839,lng:57.0834},
    {nameAr:'همدان',nameEn:'Hamedan',type:'city',lat:34.7986,lng:48.5146},
    {nameAr:'يزد',nameEn:'Yazd',type:'city',lat:31.8974,lng:54.3569},
    {nameAr:'بندر عباس',nameEn:'Bandar Abbas',type:'city',lat:27.1865,lng:56.2808},
    {nameAr:'أردبيل',nameEn:'Ardabil',type:'city',lat:38.2498,lng:48.2934},
    {nameAr:'سنندج',nameEn:'Sanandaj',type:'city',lat:35.3219,lng:46.9987},
  ],
  my: [
    {nameAr:'كوالالمبور',nameEn:'Kuala Lumpur',type:'city',lat:3.1478,lng:101.6953},
    {nameAr:'جورج تاون',nameEn:'George Town',type:'city',lat:5.4141,lng:100.3288},
    {nameAr:'ايبوه',nameEn:'Ipoh',type:'city',lat:4.5975,lng:101.0901},
    {nameAr:'جوهور بهرو',nameEn:'Johor Bahru',type:'city',lat:1.4655,lng:103.7578},
    {nameAr:'كوتا كينابالو',nameEn:'Kota Kinabalu',type:'city',lat:5.9804,lng:116.0735},
    {nameAr:'كوتشينغ',nameEn:'Kuching',type:'city',lat:1.5533,lng:110.3592},
    {nameAr:'بيتالينغ جايا',nameEn:'Petaling Jaya',type:'city',lat:3.1073,lng:101.6067},
    {nameAr:'شاه علم',nameEn:'Shah Alam',type:'city',lat:3.0733,lng:101.5185},
    {nameAr:'سيمبانغ',nameEn:'Seremban',type:'city',lat:2.7297,lng:101.9381},
    {nameAr:'كوانتان',nameEn:'Kuantan',type:'city',lat:3.8077,lng:103.3260},
    {nameAr:'ألور ستار',nameEn:'Alor Setar',type:'city',lat:6.1248,lng:100.3673},
    {nameAr:'ميري',nameEn:'Miri',type:'city',lat:4.3995,lng:113.9914},
    {nameAr:'سيبو',nameEn:'Sibu',type:'city',lat:2.3,lng:111.8167},
    {nameAr:'باهانغ',nameEn:'Pahang',type:'city',lat:3.8126,lng:103.3256},
  ],
  id: [
    {nameAr:'جاكرتا',nameEn:'Jakarta',type:'city',lat:-6.2088,lng:106.8456},
    {nameAr:'سورابايا',nameEn:'Surabaya',type:'city',lat:-7.2575,lng:112.7521},
    {nameAr:'باندونغ',nameEn:'Bandung',type:'city',lat:-6.9175,lng:107.6191},
    {nameAr:'ميدان',nameEn:'Medan',type:'city',lat:3.5952,lng:98.6722},
    {nameAr:'سيمارانغ',nameEn:'Semarang',type:'city',lat:-6.9932,lng:110.4203},
    {nameAr:'بالمبانغ',nameEn:'Palembang',type:'city',lat:-2.9167,lng:104.7458},
    {nameAr:'ماكاسار',nameEn:'Makassar',type:'city',lat:-5.1477,lng:119.4327},
    {nameAr:'يوغياكارتا',nameEn:'Yogyakarta',type:'city',lat:-7.7956,lng:110.3695},
    {nameAr:'باتام',nameEn:'Batam',type:'city',lat:1.0456,lng:104.0305},
    {nameAr:'باليكبابان',nameEn:'Balikpapan',type:'city',lat:-1.2654,lng:116.8312},
    {nameAr:'آتشيه',nameEn:'Banda Aceh',type:'city',lat:5.5483,lng:95.3238},
    {nameAr:'مناهاسا',nameEn:'Manado',type:'city',lat:1.4748,lng:124.8421},
    {nameAr:'أمبون',nameEn:'Ambon',type:'city',lat:-3.6554,lng:128.1908},
  ],
  // ── بنغلاديش ──
  bd: [
    {nameAr:'دكا',nameEn:'Dhaka',type:'city',lat:23.8103,lng:90.4125},
    {nameAr:'شيتاغونغ',nameEn:'Chittagong',type:'city',lat:22.3569,lng:91.7832},
    {nameAr:'خولنا',nameEn:'Khulna',type:'city',lat:22.8456,lng:89.5403},
    {nameAr:'راجشاهي',nameEn:'Rajshahi',type:'city',lat:24.3745,lng:88.6042},
    {nameAr:'سيلهيت',nameEn:'Sylhet',type:'city',lat:24.8949,lng:91.8687},
    {nameAr:'بارسال',nameEn:'Barisal',type:'city',lat:22.701,lng:90.3535},
    {nameAr:'رانغبور',nameEn:'Rangpur',type:'city',lat:25.7439,lng:89.2752},
    {nameAr:'ميمنسينغ',nameEn:'Mymensingh',type:'city',lat:24.7471,lng:90.4203},
    {nameAr:'كومينا',nameEn:'Comilla',type:'city',lat:23.4607,lng:91.1809},
    {nameAr:'ناراينغانج',nameEn:'Narayanganj',type:'city',lat:23.6238,lng:90.4996},
  ],
  // ── أفغانستان ──
  af: [
    {nameAr:'كابول',nameEn:'Kabul',type:'city',lat:34.5553,lng:69.2075},
    {nameAr:'قندهار',nameEn:'Kandahar',type:'city',lat:31.6289,lng:65.7372},
    {nameAr:'هرات',nameEn:'Herat',type:'city',lat:34.3482,lng:62.2042},
    {nameAr:'مزار شريف',nameEn:'Mazar-i-Sharif',type:'city',lat:36.7069,lng:67.1107},
    {nameAr:'جلال آباد',nameEn:'Jalalabad',type:'city',lat:34.4415,lng:70.4432},
    {nameAr:'كندز',nameEn:'Kunduz',type:'city',lat:36.7283,lng:68.8676},
    {nameAr:'غزني',nameEn:'Ghazni',type:'city',lat:33.5537,lng:68.4221},
    {nameAr:'بلخ',nameEn:'Balkh',type:'city',lat:36.7557,lng:66.8975},
    {nameAr:'لشكرغاه',nameEn:'Lashkar Gah',type:'city',lat:31.5932,lng:64.3693},
    {nameAr:'تالقان',nameEn:'Taloqan',type:'city',lat:36.7358,lng:69.5358},
  ],
  // ── الهند ──
  in: [
    {nameAr:'نيودلهي',nameEn:'New Delhi',type:'city',lat:28.6139,lng:77.209},
    {nameAr:'مومباي',nameEn:'Mumbai',type:'city',lat:19.076,lng:72.8777},
    {nameAr:'حيدراباد',nameEn:'Hyderabad',type:'city',lat:17.385,lng:78.4867},
    {nameAr:'أحمد آباد',nameEn:'Ahmedabad',type:'city',lat:23.0225,lng:72.5714},
    {nameAr:'بنغالور',nameEn:'Bangalore',type:'city',lat:12.9716,lng:77.5946},
    {nameAr:'تشيناي',nameEn:'Chennai',type:'city',lat:13.0827,lng:80.2707},
    {nameAr:'كولكاتا',nameEn:'Kolkata',type:'city',lat:22.5726,lng:88.3639},
    {nameAr:'بونا',nameEn:'Pune',type:'city',lat:18.5204,lng:73.8567},
    {nameAr:'لكنو',nameEn:'Lucknow',type:'city',lat:26.8467,lng:80.9462},
    {nameAr:'جيبور',nameEn:'Jaipur',type:'city',lat:26.9124,lng:75.7873},
    {nameAr:'سورات',nameEn:'Surat',type:'city',lat:21.1702,lng:72.8311},
    {nameAr:'كانبور',nameEn:'Kanpur',type:'city',lat:26.4499,lng:80.3319},
    {nameAr:'ناغبور',nameEn:'Nagpur',type:'city',lat:21.1458,lng:79.0882},
    {nameAr:'إندور',nameEn:'Indore',type:'city',lat:22.7196,lng:75.8577},
    {nameAr:'بوبال',nameEn:'Bhopal',type:'city',lat:23.2599,lng:77.4126},
  ],
  // ── الصين ──
  cn: [
    {nameAr:'بكين',nameEn:'Beijing',type:'city',lat:39.9042,lng:116.4074},
    {nameAr:'شنغهاي',nameEn:'Shanghai',type:'city',lat:31.2304,lng:121.4737},
    {nameAr:'غوانغجو',nameEn:'Guangzhou',type:'city',lat:23.1291,lng:113.2644},
    {nameAr:'شنتشن',nameEn:'Shenzhen',type:'city',lat:22.5431,lng:114.0579},
    {nameAr:'تشنغدو',nameEn:'Chengdu',type:'city',lat:30.5728,lng:104.0668},
    {nameAr:'تيانجين',nameEn:'Tianjin',type:'city',lat:39.3434,lng:117.3616},
    {nameAr:'ووهان',nameEn:'Wuhan',type:'city',lat:30.5928,lng:114.3055},
    {nameAr:'شيآن',nameEn:"Xi'an",type:'city',lat:34.3416,lng:108.9398},
    {nameAr:'هانغجو',nameEn:'Hangzhou',type:'city',lat:30.2741,lng:120.1551},
    {nameAr:'نانجينغ',nameEn:'Nanjing',type:'city',lat:32.0603,lng:118.7969},
    {nameAr:'أورومتشي',nameEn:'Urumqi',type:'city',lat:43.8256,lng:87.6168},
    {nameAr:'كاشغر',nameEn:'Kashgar',type:'city',lat:39.4704,lng:75.9895},
    {nameAr:'كونمينغ',nameEn:'Kunming',type:'city',lat:25.0453,lng:102.7097},
    {nameAr:'تشونغتشينغ',nameEn:'Chongqing',type:'city',lat:29.4316,lng:106.9123},
    {nameAr:'هاربين',nameEn:'Harbin',type:'city',lat:45.8038,lng:126.5349},
  ],
  // ── اليابان ──
  jp: [
    {nameAr:'طوكيو',nameEn:'Tokyo',type:'city',lat:35.6762,lng:139.6503},
    {nameAr:'أوساكا',nameEn:'Osaka',type:'city',lat:34.6937,lng:135.5023},
    {nameAr:'ناغويا',nameEn:'Nagoya',type:'city',lat:35.1815,lng:136.9066},
    {nameAr:'سابورو',nameEn:'Sapporo',type:'city',lat:43.0618,lng:141.3545},
    {nameAr:'فوكوكا',nameEn:'Fukuoka',type:'city',lat:33.5904,lng:130.4017},
    {nameAr:'كيوتو',nameEn:'Kyoto',type:'city',lat:35.0116,lng:135.7681},
    {nameAr:'كوبي',nameEn:'Kobe',type:'city',lat:34.6901,lng:135.1956},
    {nameAr:'كاواساكي',nameEn:'Kawasaki',type:'city',lat:35.5308,lng:139.7029},
    {nameAr:'سيتاما',nameEn:'Saitama',type:'city',lat:35.8617,lng:139.6455},
    {nameAr:'هيروشيما',nameEn:'Hiroshima',type:'city',lat:34.3853,lng:132.4553},
    {nameAr:'سيندي',nameEn:'Sendai',type:'city',lat:38.2682,lng:140.8694},
    {nameAr:'كيتاكيوشو',nameEn:'Kitakyushu',type:'city',lat:33.8834,lng:130.8751},
    {nameAr:'ناغاساكي',nameEn:'Nagasaki',type:'city',lat:32.7503,lng:129.8777},
    {nameAr:'أوكيناوا',nameEn:'Okinawa',type:'city',lat:26.2124,lng:127.6809},
    {nameAr:'يوكوهاما',nameEn:'Yokohama',type:'city',lat:35.4437,lng:139.638},
  ],
  // ── كوريا الجنوبية ──
  kr: [
    {nameAr:'سيول',nameEn:'Seoul',type:'city',lat:37.5665,lng:126.978},
    {nameAr:'بوسان',nameEn:'Busan',type:'city',lat:35.1796,lng:129.0756},
    {nameAr:'إنتشون',nameEn:'Incheon',type:'city',lat:37.4563,lng:126.7052},
    {nameAr:'دايغو',nameEn:'Daegu',type:'city',lat:35.8714,lng:128.6014},
    {nameAr:'دايجون',nameEn:'Daejeon',type:'city',lat:36.3504,lng:127.3845},
    {nameAr:'غوانغجو',nameEn:'Gwangju',type:'city',lat:35.1595,lng:126.8526},
    {nameAr:'سوون',nameEn:'Suwon',type:'city',lat:37.2636,lng:127.0286},
    {nameAr:'سيونغنام',nameEn:'Seongnam',type:'city',lat:37.4449,lng:127.1388},
    {nameAr:'يولسان',nameEn:'Ulsan',type:'city',lat:35.5384,lng:129.3114},
    {nameAr:'جيجو',nameEn:'Jeju',type:'city',lat:33.4996,lng:126.5312},
  ],
  // ── فرنسا ──
  fr: [
    {nameAr:'باريس',nameEn:'Paris',type:'city',lat:48.8566,lng:2.3522},
    {nameAr:'مرسيليا',nameEn:'Marseille',type:'city',lat:43.2965,lng:5.3698},
    {nameAr:'ليون',nameEn:'Lyon',type:'city',lat:45.7640,lng:4.8357},
    {nameAr:'تولوز',nameEn:'Toulouse',type:'city',lat:43.6047,lng:1.4442},
    {nameAr:'نيس',nameEn:'Nice',type:'city',lat:43.7102,lng:7.262},
    {nameAr:'نانت',nameEn:'Nantes',type:'city',lat:47.2184,lng:-1.5536},
    {nameAr:'ستراسبورغ',nameEn:'Strasbourg',type:'city',lat:48.5734,lng:7.7521},
    {nameAr:'مونبلييه',nameEn:'Montpellier',type:'city',lat:43.6108,lng:3.8767},
    {nameAr:'بوردو',nameEn:'Bordeaux',type:'city',lat:44.8378,lng:-0.5792},
    {nameAr:'ليل',nameEn:'Lille',type:'city',lat:50.6292,lng:3.0573},
    {nameAr:'رين',nameEn:'Rennes',type:'city',lat:48.1173,lng:-1.6778},
    {nameAr:'لو هافر',nameEn:'Le Havre',type:'city',lat:49.4938,lng:0.1077},
  ],
  // ── ألمانيا ──
  de: [
    {nameAr:'برلين',nameEn:'Berlin',type:'city',lat:52.52,lng:13.405},
    {nameAr:'هامبورغ',nameEn:'Hamburg',type:'city',lat:53.5753,lng:10.0153},
    {nameAr:'ميونيخ',nameEn:'Munich',type:'city',lat:48.1351,lng:11.582},
    {nameAr:'كولونيا',nameEn:'Cologne',type:'city',lat:50.9333,lng:6.95},
    {nameAr:'فرانكفورت',nameEn:'Frankfurt',type:'city',lat:50.1109,lng:8.6821},
    {nameAr:'شتوتغارت',nameEn:'Stuttgart',type:'city',lat:48.7758,lng:9.1829},
    {nameAr:'دوسلدورف',nameEn:'Düsseldorf',type:'city',lat:51.2217,lng:6.7762},
    {nameAr:'دورتموند',nameEn:'Dortmund',type:'city',lat:51.5136,lng:7.4653},
    {nameAr:'إيسن',nameEn:'Essen',type:'city',lat:51.4556,lng:7.0116},
    {nameAr:'لايبزيغ',nameEn:'Leipzig',type:'city',lat:51.3397,lng:12.3731},
    {nameAr:'بريمن',nameEn:'Bremen',type:'city',lat:53.0793,lng:8.8017},
    {nameAr:'درسدن',nameEn:'Dresden',type:'city',lat:51.0504,lng:13.7373},
    {nameAr:'هانوفر',nameEn:'Hanover',type:'city',lat:52.3759,lng:9.732},
    {nameAr:'نورنبرغ',nameEn:'Nuremberg',type:'city',lat:49.4521,lng:11.0767},
  ],
  // ── المملكة المتحدة ──
  gb: [
    {nameAr:'لندن',nameEn:'London',type:'city',lat:51.5074,lng:-0.1278},
    {nameAr:'برمنغهام',nameEn:'Birmingham',type:'city',lat:52.4862,lng:-1.8904},
    {nameAr:'مانشستر',nameEn:'Manchester',type:'city',lat:53.4808,lng:-2.2426},
    {nameAr:'ليدز',nameEn:'Leeds',type:'city',lat:53.8008,lng:-1.5491},
    {nameAr:'غلاسكو',nameEn:'Glasgow',type:'city',lat:55.8642,lng:-4.2518},
    {nameAr:'ليفربول',nameEn:'Liverpool',type:'city',lat:53.4084,lng:-2.9916},
    {nameAr:'إدنبرة',nameEn:'Edinburgh',type:'city',lat:55.9533,lng:-3.1883},
    {nameAr:'برستول',nameEn:'Bristol',type:'city',lat:51.4545,lng:-2.5879},
    {nameAr:'شيفيلد',nameEn:'Sheffield',type:'city',lat:53.3811,lng:-1.4701},
    {nameAr:'كاردف',nameEn:'Cardiff',type:'city',lat:51.4816,lng:-3.1791},
    {nameAr:'بلفاست',nameEn:'Belfast',type:'city',lat:54.5973,lng:-5.9301},
    {nameAr:'نيوكاسل',nameEn:'Newcastle',type:'city',lat:54.9783,lng:-1.6178},
    {nameAr:'نوتنغهام',nameEn:'Nottingham',type:'city',lat:52.9548,lng:-1.1581},
    {nameAr:'لستر',nameEn:'Leicester',type:'city',lat:52.6369,lng:-1.1398},
    {nameAr:'برادفورد',nameEn:'Bradford',type:'city',lat:53.7960,lng:-1.7594},
    {nameAr:'لوتون',nameEn:'Luton',type:'city',lat:51.8787,lng:-0.4200},
  ],
  // ── إسبانيا ──
  es: [
    {nameAr:'مدريد',nameEn:'Madrid',type:'city',lat:40.4168,lng:-3.7038},
    {nameAr:'برشلونة',nameEn:'Barcelona',type:'city',lat:41.3851,lng:2.1734},
    {nameAr:'فالنسيا',nameEn:'Valencia',type:'city',lat:39.4699,lng:-0.3763},
    {nameAr:'إشبيلية',nameEn:'Seville',type:'city',lat:37.3891,lng:-5.9845},
    {nameAr:'ثاراغوثا',nameEn:'Zaragoza',type:'city',lat:41.6488,lng:-0.8891},
    {nameAr:'مالقة',nameEn:'Málaga',type:'city',lat:36.7213,lng:-4.4214},
    {nameAr:'مرسية',nameEn:'Murcia',type:'city',lat:37.9922,lng:-1.1307},
    {nameAr:'بلباو',nameEn:'Bilbao',type:'city',lat:43.263,lng:-2.935},
    {nameAr:'أليكانتي',nameEn:'Alicante',type:'city',lat:38.3452,lng:-0.481},
    {nameAr:'قرطبة',nameEn:'Córdoba',type:'city',lat:37.8882,lng:-4.7794},
    {nameAr:'غرناطة',nameEn:'Granada',type:'city',lat:37.1773,lng:-3.5986},
    {nameAr:'سبتة',nameEn:'Ceuta',type:'city',lat:35.8894,lng:-5.3213},
    {nameAr:'مليلة',nameEn:'Melilla',type:'city',lat:35.2923,lng:-2.9381},
  ],
  // ── إيطاليا ──
  it: [
    {nameAr:'روما',nameEn:'Rome',type:'city',lat:41.9028,lng:12.4964},
    {nameAr:'ميلانو',nameEn:'Milan',type:'city',lat:45.4642,lng:9.19},
    {nameAr:'نابولي',nameEn:'Naples',type:'city',lat:40.8518,lng:14.2681},
    {nameAr:'تورينو',nameEn:'Turin',type:'city',lat:45.0703,lng:7.6869},
    {nameAr:'باليرمو',nameEn:'Palermo',type:'city',lat:38.1157,lng:13.3615},
    {nameAr:'جنوى',nameEn:'Genoa',type:'city',lat:44.4056,lng:8.9463},
    {nameAr:'بولونيا',nameEn:'Bologna',type:'city',lat:44.4949,lng:11.3426},
    {nameAr:'فلورنسا',nameEn:'Florence',type:'city',lat:43.7696,lng:11.2558},
    {nameAr:'بارى',nameEn:'Bari',type:'city',lat:41.1171,lng:16.8719},
    {nameAr:'فينيسيا',nameEn:'Venice',type:'city',lat:45.4408,lng:12.3155},
    {nameAr:'كاتانيا',nameEn:'Catania',type:'city',lat:37.5079,lng:15.083},
    {nameAr:'ميسينا',nameEn:'Messina',type:'city',lat:38.1938,lng:15.554},
  ],
  // ── هولندا ──
  nl: [
    {nameAr:'أمستردام',nameEn:'Amsterdam',type:'city',lat:52.3676,lng:4.9041},
    {nameAr:'روتردام',nameEn:'Rotterdam',type:'city',lat:51.9244,lng:4.4777},
    {nameAr:'لاهاي',nameEn:'The Hague',type:'city',lat:52.0705,lng:4.3007},
    {nameAr:'أوتريخت',nameEn:'Utrecht',type:'city',lat:52.0907,lng:5.1214},
    {nameAr:'أيندهوفن',nameEn:'Eindhoven',type:'city',lat:51.4416,lng:5.4697},
    {nameAr:'تيلبورغ',nameEn:'Tilburg',type:'city',lat:51.5555,lng:5.0913},
    {nameAr:'غرونينغن',nameEn:'Groningen',type:'city',lat:53.2194,lng:6.5665},
  ],
  // ── بلجيكا ──
  be: [
    {nameAr:'بروكسل',nameEn:'Brussels',type:'city',lat:50.8503,lng:4.3517},
    {nameAr:'غنت',nameEn:'Ghent',type:'city',lat:51.0543,lng:3.7174},
    {nameAr:'أنتورب',nameEn:'Antwerp',type:'city',lat:51.2194,lng:4.4025},
    {nameAr:'لييج',nameEn:'Liège',type:'city',lat:50.6326,lng:5.5797},
    {nameAr:'بروج',nameEn:'Bruges',type:'city',lat:51.2093,lng:3.2247},
    {nameAr:'ناميور',nameEn:'Namur',type:'city',lat:50.4669,lng:4.8675},
  ],
  // ── روسيا ──
  ru: [
    {nameAr:'موسكو',nameEn:'Moscow',type:'city',lat:55.7558,lng:37.6173},
    {nameAr:'سانت بطرسبرغ',nameEn:'Saint Petersburg',type:'city',lat:59.9343,lng:30.3351},
    {nameAr:'نوفوسيبيرسك',nameEn:'Novosibirsk',type:'city',lat:54.9885,lng:82.9207},
    {nameAr:'يكاترينبورغ',nameEn:'Yekaterinburg',type:'city',lat:56.8389,lng:60.6057},
    {nameAr:'نيجني نوفغورود',nameEn:'Nizhny Novgorod',type:'city',lat:56.2965,lng:43.9361},
    {nameAr:'قازان',nameEn:'Kazan',type:'city',lat:55.7887,lng:49.1221},
    {nameAr:'تشيليابينسك',nameEn:'Chelyabinsk',type:'city',lat:55.1644,lng:61.4368},
    {nameAr:'أومسك',nameEn:'Omsk',type:'city',lat:54.9885,lng:73.3242},
    {nameAr:'سمارة',nameEn:'Samara',type:'city',lat:53.2038,lng:50.1606},
    {nameAr:'أوفا',nameEn:'Ufa',type:'city',lat:54.7388,lng:55.9721},
    {nameAr:'غروزني',nameEn:'Grozny',type:'city',lat:43.3189,lng:45.6984},
    {nameAr:'ماخاتشقلا',nameEn:'Makhachkala',type:'city',lat:42.9849,lng:47.5047},
  ],
  // ── الولايات المتحدة ──
  us: [
    {nameAr:'نيويورك',nameEn:'New York',type:'city',lat:40.7128,lng:-74.006},
    {nameAr:'لوس أنجلوس',nameEn:'Los Angeles',type:'city',lat:34.0522,lng:-118.2437},
    {nameAr:'شيكاغو',nameEn:'Chicago',type:'city',lat:41.8781,lng:-87.6298},
    {nameAr:'هيوستن',nameEn:'Houston',type:'city',lat:29.7604,lng:-95.3698},
    {nameAr:'فينيكس',nameEn:'Phoenix',type:'city',lat:33.4484,lng:-112.074},
    {nameAr:'فيلادلفيا',nameEn:'Philadelphia',type:'city',lat:39.9526,lng:-75.1652},
    {nameAr:'سان أنطونيو',nameEn:'San Antonio',type:'city',lat:29.4241,lng:-98.4936},
    {nameAr:'سان دييغو',nameEn:'San Diego',type:'city',lat:32.7157,lng:-117.1611},
    {nameAr:'دالاس',nameEn:'Dallas',type:'city',lat:32.7767,lng:-96.797},
    {nameAr:'سان خوسيه',nameEn:'San Jose',type:'city',lat:37.3382,lng:-121.8863},
    {nameAr:'واشنطن',nameEn:'Washington DC',type:'city',lat:38.9072,lng:-77.0369},
    {nameAr:'ديترويت',nameEn:'Detroit',type:'city',lat:42.3314,lng:-83.0458},
    {nameAr:'دير بورن',nameEn:'Dearborn',type:'city',lat:42.3223,lng:-83.1763},
    {nameAr:'جيرسي سيتي',nameEn:'Jersey City',type:'city',lat:40.7178,lng:-74.0431},
    {nameAr:'فريمونت',nameEn:'Fremont',type:'city',lat:37.5485,lng:-121.9886},
    {nameAr:'باترسون',nameEn:'Paterson',type:'city',lat:40.9168,lng:-74.1719},
  ],
  // ── كندا ──
  ca: [
    {nameAr:'تورنتو',nameEn:'Toronto',type:'city',lat:43.7001,lng:-79.4163},
    {nameAr:'مونتريال',nameEn:'Montreal',type:'city',lat:45.5017,lng:-73.5673},
    {nameAr:'كالغاري',nameEn:'Calgary',type:'city',lat:51.0447,lng:-114.0719},
    {nameAr:'أوتاوا',nameEn:'Ottawa',type:'city',lat:45.4215,lng:-75.6972},
    {nameAr:'إدمنتون',nameEn:'Edmonton',type:'city',lat:53.5461,lng:-113.4938},
    {nameAr:'ميسيساغا',nameEn:'Mississauga',type:'city',lat:43.589,lng:-79.6441},
    {nameAr:'وينيبيغ',nameEn:'Winnipeg',type:'city',lat:49.8951,lng:-97.1384},
    {nameAr:'فانكوفر',nameEn:'Vancouver',type:'city',lat:49.2827,lng:-123.1207},
    {nameAr:'هاميلتون',nameEn:'Hamilton',type:'city',lat:43.2557,lng:-79.8711},
    {nameAr:'كيبيك',nameEn:'Quebec City',type:'city',lat:46.8139,lng:-71.2082},
    {nameAr:'سري',nameEn:'Surrey',type:'city',lat:49.1913,lng:-122.849},
    {nameAr:'هاليفاكس',nameEn:'Halifax',type:'city',lat:44.6488,lng:-63.5752},
  ],
  // ── أستراليا ──
  au: [
    {nameAr:'سيدني',nameEn:'Sydney',type:'city',lat:-33.8688,lng:151.2093},
    {nameAr:'ملبورن',nameEn:'Melbourne',type:'city',lat:-37.8136,lng:144.9631},
    {nameAr:'بريسبان',nameEn:'Brisbane',type:'city',lat:-27.4698,lng:153.0251},
    {nameAr:'بيرث',nameEn:'Perth',type:'city',lat:-31.9505,lng:115.8605},
    {nameAr:'أديلايد',nameEn:'Adelaide',type:'city',lat:-34.9285,lng:138.6007},
    {nameAr:'كانبيرا',nameEn:'Canberra',type:'city',lat:-35.2809,lng:149.13},
    {nameAr:'هوبارت',nameEn:'Hobart',type:'city',lat:-42.8821,lng:147.3272},
    {nameAr:'داروين',nameEn:'Darwin',type:'city',lat:-12.4634,lng:130.8456},
    {nameAr:'غولد كوست',nameEn:'Gold Coast',type:'city',lat:-28.0167,lng:153.4},
    {nameAr:'نيوكاسل',nameEn:'Newcastle',type:'city',lat:-32.9167,lng:151.75},
    {nameAr:'ولونغونغ',nameEn:'Wollongong',type:'city',lat:-34.4278,lng:150.8931},
    {nameAr:'لاكمبا',nameEn:'Lakemba',type:'city',lat:-33.9167,lng:151.0667},
  ],
  // ── تركيا ─ إضافة مدن بخلاف الموجودة ──
  // (tr موجودة سابقاً في STATIC_CITIES)
  // ── ماليزيا ─ موجودة سابقاً ──
  // ── نيجيريا ──
  ng: [
    {nameAr:'أبوجا',nameEn:'Abuja',type:'city',lat:9.0765,lng:7.3986},
    {nameAr:'لاغوس',nameEn:'Lagos',type:'city',lat:6.5244,lng:3.3792},
    {nameAr:'كانو',nameEn:'Kano',type:'city',lat:12.0022,lng:8.5920},
    {nameAr:'إبادان',nameEn:'Ibadan',type:'city',lat:7.3775,lng:3.9470},
    {nameAr:'كادونا',nameEn:'Kaduna',type:'city',lat:10.5264,lng:7.4384},
    {nameAr:'بنين سيتي',nameEn:'Benin City',type:'city',lat:6.3176,lng:5.6145},
    {nameAr:'بورت هاركورت',nameEn:'Port Harcourt',type:'city',lat:4.8156,lng:7.0498},
    {nameAr:'زاريا',nameEn:'Zaria',type:'city',lat:11.0855,lng:7.7199},
    {nameAr:'ميدوغوري',nameEn:'Maiduguri',type:'city',lat:11.8333,lng:13.15},
    {nameAr:'سوكوتو',nameEn:'Sokoto',type:'city',lat:13.0059,lng:5.2476},
  ],
  // ── إثيوبيا ──
  et: [
    {nameAr:'أديس أبابا',nameEn:'Addis Ababa',type:'city',lat:9.03,lng:38.74},
    {nameAr:'ديرة داوة',nameEn:'Dire Dawa',type:'city',lat:9.5935,lng:41.8661},
    {nameAr:'ميكيلي',nameEn:'Mekelle',type:'city',lat:13.4967,lng:39.4753},
    {nameAr:'غوندر',nameEn:'Gondar',type:'city',lat:12.6,lng:37.4667},
    {nameAr:'عواسا',nameEn:'Awasa',type:'city',lat:7.05,lng:38.4667},
    {nameAr:'هرار',nameEn:'Harar',type:'city',lat:9.3125,lng:42.1196},
    {nameAr:'نازريت',nameEn:'Adama',type:'city',lat:8.5414,lng:39.2678},
    {nameAr:'جيما',nameEn:'Jimma',type:'city',lat:7.6833,lng:36.8333},
  ],
  // ── كينيا ──
  ke: [
    {nameAr:'نيروبي',nameEn:'Nairobi',type:'city',lat:-1.2921,lng:36.8219},
    {nameAr:'مومباسا',nameEn:'Mombasa',type:'city',lat:-4.0435,lng:39.6682},
    {nameAr:'كيسومو',nameEn:'Kisumu',type:'city',lat:-0.1022,lng:34.7617},
    {nameAr:'نكورو',nameEn:'Nakuru',type:'city',lat:-0.3031,lng:36.08},
    {nameAr:'مالندي',nameEn:'Malindi',type:'city',lat:-3.2138,lng:40.1169},
    {nameAr:'غاريسا',nameEn:'Garissa',type:'city',lat:-0.4532,lng:39.6461},
    {nameAr:'موندي',nameEn:'Mwingi',type:'city',lat:-0.9347,lng:38.0618},
  ],
  // ── جنوب أفريقيا ──
  za: [
    {nameAr:'جوهانسبرغ',nameEn:'Johannesburg',type:'city',lat:-26.2041,lng:28.0473},
    {nameAr:'كيب تاون',nameEn:'Cape Town',type:'city',lat:-33.9249,lng:18.4241},
    {nameAr:'دربان',nameEn:'Durban',type:'city',lat:-29.8587,lng:31.0218},
    {nameAr:'بريتوريا',nameEn:'Pretoria',type:'city',lat:-25.7479,lng:28.2293},
    {nameAr:'بورت إليزابيث',nameEn:'Port Elizabeth',type:'city',lat:-33.9608,lng:25.6022},
    {nameAr:'بلومفونتين',nameEn:'Bloemfontein',type:'city',lat:-29.0852,lng:26.1596},
    {nameAr:'إيست لندن',nameEn:'East London',type:'city',lat:-33.0153,lng:27.9116},
  ],
  // ── أوزبكستان ──
  uz: [
    {nameAr:'طاشقند',nameEn:'Tashkent',type:'city',lat:41.2995,lng:69.2401},
    {nameAr:'سمرقند',nameEn:'Samarkand',type:'city',lat:39.6547,lng:66.9758},
    {nameAr:'نمنغان',nameEn:'Namangan',type:'city',lat:40.9983,lng:71.6726},
    {nameAr:'أنديجان',nameEn:'Andijan',type:'city',lat:40.7829,lng:72.3442},
    {nameAr:'بخارى',nameEn:'Bukhara',type:'city',lat:39.7747,lng:64.4286},
    {nameAr:'قرشي',nameEn:'Qarshi',type:'city',lat:38.8610,lng:65.7908},
    {nameAr:'فرغانة',nameEn:'Fergana',type:'city',lat:40.3864,lng:71.7864},
  ],
  // ── كازاخستان ──
  kz: [
    {nameAr:'نور سلطان',nameEn:'Astana',type:'city',lat:51.1801,lng:71.446},
    {nameAr:'ألماتي',nameEn:'Almaty',type:'city',lat:43.2551,lng:76.9126},
    {nameAr:'شيمكنت',nameEn:'Shymkent',type:'city',lat:42.3,lng:69.6},
    {nameAr:'راغاندي',nameEn:'Karaganda',type:'city',lat:49.8047,lng:73.0875},
    {nameAr:'أكتوبي',nameEn:'Aktobe',type:'city',lat:50.2839,lng:57.1669},
    {nameAr:'أتيراو',nameEn:'Atyrau',type:'city',lat:47.1167,lng:51.8833},
  ],
  // ── السنغال ──
  sn: [
    {nameAr:'داكار',nameEn:'Dakar',type:'city',lat:14.6937,lng:-17.4441},
    {nameAr:'توبا',nameEn:'Touba',type:'city',lat:14.85,lng:-15.88},
    {nameAr:'ثيس',nameEn:'Thiès',type:'city',lat:14.7833,lng:-16.9167},
    {nameAr:'زيغينشور',nameEn:'Ziguinchor',type:'city',lat:12.5833,lng:-16.2667},
    {nameAr:'كاولاك',nameEn:'Kaolack',type:'city',lat:14.1504,lng:-16.0726},
    {nameAr:'سانت لويس',nameEn:'Saint-Louis',type:'city',lat:16.0179,lng:-16.4896},
  ],
  // ── الصومال ──
  so: [
    {nameAr:'مقديشو',nameEn:'Mogadishu',type:'city',lat:2.0469,lng:45.3182},
    {nameAr:'هرجيسا',nameEn:'Hargeisa',type:'city',lat:9.56,lng:44.065},
    {nameAr:'كيسمايو',nameEn:'Kismayo',type:'city',lat:-0.3582,lng:42.5454},
    {nameAr:'بيدوا',nameEn:'Baidoa',type:'city',lat:3.1069,lng:43.6499},
    {nameAr:'بوساسو',nameEn:'Bosaso',type:'city',lat:11.2833,lng:49.1833},
    {nameAr:'غاروي',nameEn:'Garowe',type:'city',lat:8.4054,lng:48.4845},
  ],
  // ── السويد ──
  se: [
    {nameAr:'ستوكهولم',nameEn:'Stockholm',type:'city',lat:59.3293,lng:18.0686},
    {nameAr:'غوتنبرغ',nameEn:'Gothenburg',type:'city',lat:57.7089,lng:11.9746},
    {nameAr:'مالمو',nameEn:'Malmö',type:'city',lat:55.6049,lng:13.0038},
    {nameAr:'أوبسالا',nameEn:'Uppsala',type:'city',lat:59.8586,lng:17.6389},
    {nameAr:'سودرتاليا',nameEn:'Södertälje',type:'city',lat:59.1955,lng:17.6253},
    {nameAr:'فسترأس',nameEn:'Västerås',type:'city',lat:59.6162,lng:16.5528},
  ],
  // ── النرويج ──
  no: [
    {nameAr:'أوسلو',nameEn:'Oslo',type:'city',lat:59.9139,lng:10.7522},
    {nameAr:'برغن',nameEn:'Bergen',type:'city',lat:60.3913,lng:5.3221},
    {nameAr:'تروندهايم',nameEn:'Trondheim',type:'city',lat:63.4305,lng:10.3951},
    {nameAr:'ستافانغر',nameEn:'Stavanger',type:'city',lat:58.9700,lng:5.7331},
    {nameAr:'تروم سو',nameEn:'Tromsø',type:'city',lat:69.6489,lng:18.9551},
  ],
  // ── الدنمارك ──
  dk: [
    {nameAr:'كوبنهاغن',nameEn:'Copenhagen',type:'city',lat:55.6761,lng:12.5683},
    {nameAr:'أورهوس',nameEn:'Aarhus',type:'city',lat:56.1629,lng:10.2039},
    {nameAr:'أودينسي',nameEn:'Odense',type:'city',lat:55.3959,lng:10.3883},
    {nameAr:'ألبورغ',nameEn:'Aalborg',type:'city',lat:57.0488,lng:9.9217},
    {nameAr:'إسبيرغ',nameEn:'Esbjerg',type:'city',lat:55.4761,lng:8.4594},
  ],
  // ── فنلندا ──
  fi: [
    {nameAr:'هلسنكي',nameEn:'Helsinki',type:'city',lat:60.1699,lng:24.9384},
    {nameAr:'إسبو',nameEn:'Espoo',type:'city',lat:60.2052,lng:24.6522},
    {nameAr:'تامبيري',nameEn:'Tampere',type:'city',lat:61.4978,lng:23.7610},
    {nameAr:'فانتا',nameEn:'Vantaa',type:'city',lat:60.2934,lng:25.0378},
    {nameAr:'أولو',nameEn:'Oulu',type:'city',lat:65.0121,lng:25.4651},
    {nameAr:'تورك',nameEn:'Turku',type:'city',lat:60.4518,lng:22.2666},
  ],
  // ── البرازيل ──
  br: [
    {nameAr:'ساو باولو',nameEn:'São Paulo',type:'city',lat:-23.5505,lng:-46.6333},
    {nameAr:'ريو دي جانيرو',nameEn:'Rio de Janeiro',type:'city',lat:-22.9068,lng:-43.1729},
    {nameAr:'برازيليا',nameEn:'Brasília',type:'city',lat:-15.7801,lng:-47.9292},
    {nameAr:'سلفادور',nameEn:'Salvador',type:'city',lat:-12.9714,lng:-38.5014},
    {nameAr:'فورتاليزا',nameEn:'Fortaleza',type:'city',lat:-3.7172,lng:-38.5433},
    {nameAr:'بيلو هوريزونتي',nameEn:'Belo Horizonte',type:'city',lat:-19.9167,lng:-43.9345},
    {nameAr:'ماناوس',nameEn:'Manaus',type:'city',lat:-3.1019,lng:-60.025},
    {nameAr:'كوريتيبا',nameEn:'Curitiba',type:'city',lat:-25.4284,lng:-49.2733},
    {nameAr:'ريسيفي',nameEn:'Recife',type:'city',lat:-8.0578,lng:-34.8829},
    {nameAr:'بيلم',nameEn:'Belém',type:'city',lat:-1.4558,lng:-48.5044},
  ],
  // ── الأرجنتين ──
  ar: [
    {nameAr:'بوينس آيرس',nameEn:'Buenos Aires',type:'city',lat:-34.6037,lng:-58.3816},
    {nameAr:'قرطبة',nameEn:'Córdoba',type:'city',lat:-31.4135,lng:-64.1811},
    {nameAr:'روساريو',nameEn:'Rosario',type:'city',lat:-32.9442,lng:-60.6505},
    {nameAr:'ميندوزا',nameEn:'Mendoza',type:'city',lat:-32.8895,lng:-68.8458},
    {nameAr:'لا بلاتا',nameEn:'La Plata',type:'city',lat:-34.9211,lng:-57.9544},
    {nameAr:'سان خوان',nameEn:'San Juan',type:'city',lat:-31.5375,lng:-68.5364},
  ],
  // ── المكسيك ──
  mx: [
    {nameAr:'مكسيكو سيتي',nameEn:'Mexico City',type:'city',lat:19.4326,lng:-99.1332},
    {nameAr:'غوادالاخارا',nameEn:'Guadalajara',type:'city',lat:20.6597,lng:-103.3496},
    {nameAr:'مونتيري',nameEn:'Monterrey',type:'city',lat:25.6866,lng:-100.3161},
    {nameAr:'بويبلا',nameEn:'Puebla',type:'city',lat:19.0414,lng:-98.2063},
    {nameAr:'تيخوانا',nameEn:'Tijuana',type:'city',lat:32.5149,lng:-117.0382},
    {nameAr:'ليون',nameEn:'León',type:'city',lat:21.1221,lng:-101.6827},
    {nameAr:'خواريز',nameEn:'Ciudad Juárez',type:'city',lat:31.7381,lng:-106.4869},
  ],
};

// ===== بيانات العواصم الكاملة (اسم عربي + إنجليزي + إحداثيات) =====
const CAPITAL_DATA = {
    sa:{nameAr:'الرياض',       nameEn:'Riyadh',        lat:24.6877,  lng:46.7219},
    sy:{nameAr:'دمشق',         nameEn:'Damascus',      lat:33.5102,  lng:36.2913},
    eg:{nameAr:'القاهرة',      nameEn:'Cairo',         lat:30.0444,  lng:31.2357},
    iq:{nameAr:'بغداد',        nameEn:'Baghdad',       lat:33.3152,  lng:44.3661},
    jo:{nameAr:'عمّان',        nameEn:'Amman',         lat:31.9539,  lng:35.9106},
    lb:{nameAr:'بيروت',        nameEn:'Beirut',        lat:33.8869,  lng:35.5131},
    ps:{nameAr:'القدس',        nameEn:'Jerusalem',     lat:31.7683,  lng:35.2137},
    kw:{nameAr:'الكويت',       nameEn:'Kuwait City',   lat:29.3697,  lng:47.9783},
    ae:{nameAr:'أبوظبي',       nameEn:'Abu Dhabi',     lat:24.4539,  lng:54.3773},
    qa:{nameAr:'الدوحة',       nameEn:'Doha',          lat:25.2854,  lng:51.531},
    bh:{nameAr:'المنامة',      nameEn:'Manama',        lat:26.215,   lng:50.5832},
    om:{nameAr:'مسقط',         nameEn:'Muscat',        lat:23.5957,  lng:58.5933},
    ye:{nameAr:'صنعاء',        nameEn:'Sanaa',         lat:15.3694,  lng:44.191},
    ly:{nameAr:'طرابلس',       nameEn:'Tripoli',       lat:32.8872,  lng:13.1913},
    tn:{nameAr:'تونس',         nameEn:'Tunis',         lat:36.8065,  lng:10.1815},
    dz:{nameAr:'الجزائر العاصمة',nameEn:'Algiers',    lat:36.7372,  lng:3.0865},
    ma:{nameAr:'الرباط',       nameEn:'Rabat',         lat:34.0209,  lng:-6.8417},
    sd:{nameAr:'الخرطوم',      nameEn:'Khartoum',      lat:15.5007,  lng:32.5599},
    pk:{nameAr:'إسلام آباد',   nameEn:'Islamabad',     lat:33.6844,  lng:73.0479},
    tr:{nameAr:'أنقرة',        nameEn:'Ankara',        lat:39.9334,  lng:32.8597},
    ir:{nameAr:'طهران',        nameEn:'Tehran',        lat:35.6892,  lng:51.389},
    id:{nameAr:'جاكرتا',       nameEn:'Jakarta',       lat:-6.2088,  lng:106.8456},
    my:{nameAr:'كوالالمبور',   nameEn:'Kuala Lumpur',  lat:3.1478,   lng:101.6953},
    bd:{nameAr:'دكا',          nameEn:'Dhaka',         lat:23.7104,  lng:90.4074},
    af:{nameAr:'كابول',        nameEn:'Kabul',         lat:34.5553,  lng:69.2075},
    in:{nameAr:'نيودلهي',      nameEn:'New Delhi',     lat:28.6139,  lng:77.209},
    lk:{nameAr:'كولومبو',      nameEn:'Colombo',       lat:6.9271,   lng:79.8612},
    np:{nameAr:'كاتماندو',     nameEn:'Kathmandu',     lat:27.7172,  lng:85.3240},
    cn:{nameAr:'بكين',         nameEn:'Beijing',       lat:39.9042,  lng:116.4074},
    jp:{nameAr:'طوكيو',        nameEn:'Tokyo',         lat:35.6762,  lng:139.6503},
    kr:{nameAr:'سيول',         nameEn:'Seoul',         lat:37.5665,  lng:126.978},
    mn:{nameAr:'أولان باتور',  nameEn:'Ulaanbaatar',   lat:47.8864,  lng:106.9057},
    fr:{nameAr:'باريس',        nameEn:'Paris',         lat:48.8566,  lng:2.3522},
    de:{nameAr:'برلين',        nameEn:'Berlin',        lat:52.52,    lng:13.405},
    gb:{nameAr:'لندن',         nameEn:'London',        lat:51.5074,  lng:-0.1278},
    es:{nameAr:'مدريد',        nameEn:'Madrid',        lat:40.4168,  lng:-3.7038},
    it:{nameAr:'روما',         nameEn:'Rome',          lat:41.9028,  lng:12.4964},
    nl:{nameAr:'أمستردام',     nameEn:'Amsterdam',     lat:52.3676,  lng:4.9041},
    be:{nameAr:'بروكسل',       nameEn:'Brussels',      lat:50.8503,  lng:4.3517},
    pt:{nameAr:'لشبونة',       nameEn:'Lisbon',        lat:38.7223,  lng:-9.1393},
    se:{nameAr:'ستوكهولم',     nameEn:'Stockholm',     lat:59.3293,  lng:18.0686},
    no:{nameAr:'أوسلو',        nameEn:'Oslo',          lat:59.9139,  lng:10.7522},
    dk:{nameAr:'كوبنهاغن',     nameEn:'Copenhagen',    lat:55.6761,  lng:12.5683},
    fi:{nameAr:'هلسنكي',       nameEn:'Helsinki',      lat:60.1699,  lng:24.9384},
    pl:{nameAr:'وارسو',        nameEn:'Warsaw',        lat:52.2297,  lng:21.0122},
    ru:{nameAr:'موسكو',        nameEn:'Moscow',        lat:55.7558,  lng:37.6173},
    ua:{nameAr:'كييف',         nameEn:'Kyiv',          lat:50.4501,  lng:30.5234},
    ch:{nameAr:'برن',          nameEn:'Bern',          lat:46.9481,  lng:7.4474},
    at:{nameAr:'فيينا',        nameEn:'Vienna',        lat:48.2082,  lng:16.3738},
    gr:{nameAr:'أثينا',        nameEn:'Athens',        lat:37.9838,  lng:23.7275},
    cz:{nameAr:'براغ',         nameEn:'Prague',        lat:50.0755,  lng:14.4378},
    ro:{nameAr:'بوخارست',      nameEn:'Bucharest',     lat:44.4268,  lng:26.1025},
    us:{nameAr:'واشنطن',       nameEn:'Washington',    lat:38.9072,  lng:-77.0369},
    ca:{nameAr:'أوتاوا',       nameEn:'Ottawa',        lat:45.4215,  lng:-75.6972},
    mx:{nameAr:'مكسيكو سيتي',  nameEn:'Mexico City',   lat:19.4326,  lng:-99.1332},
    br:{nameAr:'برازيليا',     nameEn:'Brasilia',      lat:-15.7939, lng:-47.8828},
    ar:{nameAr:'بوينس آيرس',   nameEn:'Buenos Aires',  lat:-34.6037, lng:-58.3816},
    co:{nameAr:'بوغوتا',       nameEn:'Bogota',        lat:4.711,    lng:-74.0721},
    pe:{nameAr:'ليما',         nameEn:'Lima',          lat:-12.0464, lng:-77.0428},
    ve:{nameAr:'كاراكاس',      nameEn:'Caracas',       lat:10.4806,  lng:-66.9036},
    cl:{nameAr:'سانتياغو',     nameEn:'Santiago',      lat:-33.4489, lng:-70.6693},
    ec:{nameAr:'كيتو',         nameEn:'Quito',         lat:-0.1807,  lng:-78.4678},
    bo:{nameAr:'سوكري',        nameEn:'Sucre',         lat:-19.0196, lng:-65.2619},
    py:{nameAr:'أسونسيون',     nameEn:'Asuncion',      lat:-25.2867, lng:-57.647},
    uy:{nameAr:'مونتيفيديو',   nameEn:'Montevideo',    lat:-34.9011, lng:-56.1645},
    ng:{nameAr:'أبوجا',        nameEn:'Abuja',         lat:9.0765,   lng:7.3986},
    et:{nameAr:'أديس أبابا',   nameEn:'Addis Ababa',   lat:9.005,    lng:38.7636},
    ke:{nameAr:'نيروبي',       nameEn:'Nairobi',       lat:-1.2921,  lng:36.8219},
    tz:{nameAr:'دودوما',       nameEn:'Dodoma',        lat:-6.1731,  lng:35.7395},
    za:{nameAr:'بريتوريا',     nameEn:'Pretoria',      lat:-25.7461, lng:28.1881},
    gh:{nameAr:'أكرا',         nameEn:'Accra',         lat:5.6037,   lng:-0.187},
    sn:{nameAr:'داكار',        nameEn:'Dakar',         lat:14.6928,  lng:-17.4467},
    cm:{nameAr:'ياوندي',       nameEn:'Yaounde',       lat:3.848,    lng:11.5021},
    ml:{nameAr:'باماكو',       nameEn:'Bamako',        lat:12.6392,  lng:-8.0029},
    so:{nameAr:'مقديشو',       nameEn:'Mogadishu',     lat:2.0469,   lng:45.3182},
    ug:{nameAr:'كمبالا',       nameEn:'Kampala',       lat:0.3476,   lng:32.5825},
    mr:{nameAr:'نواكشوط',      nameEn:'Nouakchott',    lat:18.0735,  lng:-15.9582},
    td:{nameAr:'نجامينا',      nameEn:'N\'Djamena',    lat:12.1048,  lng:15.044},
    ne:{nameAr:'نيامي',        nameEn:'Niamey',        lat:13.5137,  lng:2.1098},
    au:{nameAr:'كانبيرا',      nameEn:'Canberra',      lat:-35.2809, lng:149.13},
    nz:{nameAr:'ويلينغتون',    nameEn:'Wellington',    lat:-41.2865, lng:174.7762},
    // Round 7k — 40 عاصمة جديدة
    ba:{nameAr:'سراييفو',      nameEn:'Sarajevo',      lat:43.8563,  lng:18.4131},
    al:{nameAr:'تيرانا',       nameEn:'Tirana',        lat:41.3275,  lng:19.8187},
    mk:{nameAr:'سكوبيه',       nameEn:'Skopje',        lat:41.9981,  lng:21.4254},
    bf:{nameAr:'واغادوغو',     nameEn:'Ouagadougou',   lat:12.3714,  lng:-1.5197},
    ci:{nameAr:'ياموسوكرو',    nameEn:'Yamoussoukro',  lat:6.8276,   lng:-5.2893},
    gn:{nameAr:'كوناكري',      nameEn:'Conakry',       lat:9.6412,   lng:-13.5784},
    gm:{nameAr:'بانجول',       nameEn:'Banjul',        lat:13.4549,  lng:-16.5790},
    sl:{nameAr:'فريتاون',      nameEn:'Freetown',      lat:8.4840,   lng:-13.2299},
    mv:{nameAr:'ماليه',        nameEn:'Malé',          lat:4.1755,   lng:73.5093},
    er:{nameAr:'أسمرة',        nameEn:'Asmara',        lat:15.3229,  lng:38.9251},
    ss:{nameAr:'جوبا',         nameEn:'Juba',          lat:4.8594,   lng:31.5713},
    tg:{nameAr:'لومي',         nameEn:'Lomé',          lat:6.1319,   lng:1.2228},
    bj:{nameAr:'بورتو نوفو',   nameEn:'Porto-Novo',    lat:6.4969,   lng:2.6289},
    ie:{nameAr:'دبلن',         nameEn:'Dublin',        lat:53.3498,  lng:-6.2603},
    hu:{nameAr:'بودابست',      nameEn:'Budapest',      lat:47.4979,  lng:19.0402},
    hr:{nameAr:'زغرب',         nameEn:'Zagreb',        lat:45.8150,  lng:15.9819},
    rs:{nameAr:'بلغراد',       nameEn:'Belgrade',      lat:44.7866,  lng:20.4489},
    bg:{nameAr:'صوفيا',        nameEn:'Sofia',         lat:42.6977,  lng:23.3219},
    si:{nameAr:'ليوبليانا',    nameEn:'Ljubljana',     lat:46.0569,  lng:14.5058},
    sk:{nameAr:'براتيسلافا',   nameEn:'Bratislava',    lat:48.1486,  lng:17.1077},
    mg:{nameAr:'أنتاناناريفو', nameEn:'Antananarivo',  lat:-18.8792, lng:47.5079},
    mz:{nameAr:'مابوتو',       nameEn:'Maputo',        lat:-25.9653, lng:32.5892},
    ao:{nameAr:'لواندا',       nameEn:'Luanda',        lat:-8.8390,  lng:13.2894},
    cd:{nameAr:'كينشاسا',      nameEn:'Kinshasa',      lat:-4.4419,  lng:15.2663},
    rw:{nameAr:'كيغالي',       nameEn:'Kigali',        lat:-1.9441,  lng:30.0619},
    zw:{nameAr:'هراري',        nameEn:'Harare',        lat:-17.8252, lng:31.0335},
    zm:{nameAr:'لوساكا',       nameEn:'Lusaka',        lat:-15.3875, lng:28.3228},
    mu:{nameAr:'بورت لويس',    nameEn:'Port Louis',    lat:-20.1609, lng:57.5012},
    lr:{nameAr:'مونروفيا',     nameEn:'Monrovia',      lat:6.3004,   lng:-10.7969},
    mw:{nameAr:'ليلونغوي',     nameEn:'Lilongwe',      lat:-13.9626, lng:33.7741},
    sr:{nameAr:'باراماريبو',   nameEn:'Paramaribo',    lat:5.8520,   lng:-55.2038},
    gy:{nameAr:'جورج تاون',    nameEn:'Georgetown',    lat:6.8013,   lng:-58.1551},
    tt:{nameAr:'بورت أوف سبين',nameEn:'Port of Spain', lat:10.6596,  lng:-61.5086},
    jm:{nameAr:'كينغستون',     nameEn:'Kingston',      lat:18.0179,  lng:-76.8099},
    pa:{nameAr:'مدينة بنما',   nameEn:'Panama City',   lat:8.9824,   lng:-79.5199},
    ht:{nameAr:'بورت أو برنس', nameEn:'Port-au-Prince',lat:18.5944,  lng:-72.3074},
    cr:{nameAr:'سان خوسيه',    nameEn:'San José',      lat:9.9281,   lng:-84.0907},
    bt:{nameAr:'ثيمفو',        nameEn:'Thimphu',       lat:27.4728,  lng:89.6390},
    fj:{nameAr:'سوفا',         nameEn:'Suva',          lat:-18.1416, lng:178.4419},
    pg:{nameAr:'بورت مورسبي',  nameEn:'Port Moresby',  lat:-9.4438,  lng:147.1803},
};

// ===== إزالة المدن المكررة (بالاسم فقط) =====
function deduplicateCities(cities) {
    const seenNames = new Set();
    const result = [];
    for (const city of cities) {
        const key = (city.nameAr || '').trim();
        if (!key) continue;
        if (seenNames.has(key)) continue;
        seenNames.add(key);
        result.push(city);
    }
    return result;
}

function sortWithCapitalFirst(cities, cc) {
    const cap = CAPITAL_DATA[cc];
    if (!cap) {
        // بدون عاصمة: الأكثر سكاناً أولاً، ثم ترتيب أبجدي
        return cities.sort((a, b) => {
            if (b.pop && a.pop) return b.pop - a.pop;
            if (b.pop) return 1;
            if (a.pop) return -1;
            return a.nameAr.localeCompare(b.nameAr, 'ar');
        });
    }

    const capNameEn = (cap.nameEn || '').toLowerCase();
    const capNameAr = cap.nameAr || '';

    // أزل العاصمة من القائمة إن وُجدت لتجنب التكرار
    const filtered = cities.filter(c => {
        const enMatch = (c.nameEn || '').toLowerCase().includes(capNameEn.split(' ')[0]);
        const arMatch = c.nameAr === capNameAr;
        return !enMatch && !arMatch;
    });

    // رتّب: الأكثر سكاناً أولاً، ثم بدون سكان ترتيباً أبجدياً
    const sorted = filtered.sort((a, b) => {
        if (b.pop && a.pop) return b.pop - a.pop;
        if (b.pop) return 1;
        if (a.pop) return -1;
        return a.nameAr.localeCompare(b.nameAr, 'ar');
    });

    // أضف العاصمة في المقدمة دائماً
    const capitalCity = { nameAr: cap.nameAr, nameEn: cap.nameEn, type: 'city', lat: cap.lat, lng: cap.lng };
    return [capitalCity, ...sorted];
}

// ===== Wikidata fallback  =====
const COUNTRY_QID = {
    // الشرق الأوسط وشمال أفريقيا
    sa:'Q851',  sy:'Q858',  eg:'Q79',   iq:'Q796',  jo:'Q810',
    lb:'Q822',  ps:'Q219060', kw:'Q817', ae:'Q878', qa:'Q846',
    bh:'Q398',  om:'Q842',  ye:'Q805',  ly:'Q1016', tn:'Q948',
    dz:'Q262',  ma:'Q1028', sd:'Q1049',
    // جنوب وجنوب شرق آسيا
    pk:'Q843',  tr:'Q43',   ir:'Q794',  id:'Q252',  my:'Q833',
    bd:'Q902',  af:'Q889',  in:'Q668',  lk:'Q854',  np:'Q837',
    th:'Q869',  ph:'Q928',  vn:'Q881',  mm:'Q836',  kh:'Q424',
    la:'Q819',  sg:'Q334',  bn:'Q921',  tl:'Q574',  uz:'Q265',
    kz:'Q232',  kg:'Q813',  tj:'Q863',  tm:'Q874',  az:'Q227',
    ge:'Q230',  am:'Q399',
    // شرق آسيا
    cn:'Q148',  jp:'Q17',   kr:'Q884',  kp:'Q423',  mn:'Q711',
    // أوروبا
    fr:'Q142',  de:'Q183',  gb:'Q145',  es:'Q29',   it:'Q38',
    nl:'Q55',   be:'Q31',   pt:'Q45',   se:'Q34',   no:'Q20',
    dk:'Q35',   fi:'Q33',   pl:'Q36',   ru:'Q159',  ua:'Q212',
    ch:'Q39',   at:'Q40',   gr:'Q41',   cz:'Q213',  ro:'Q218',
    // أمريكا الشمالية
    us:'Q30',   ca:'Q16',   mx:'Q96',
    // أمريكا الوسطى والكاريبي
    gt:'Q774',  hn:'Q783',  sv:'Q792',  ni:'Q811',  cr:'Q800',
    pa:'Q804',  cu:'Q241',  do:'Q786',
    // أمريكا الجنوبية
    br:'Q155',  ar:'Q414',  co:'Q739',  pe:'Q419',  ve:'Q717',
    cl:'Q298',  ec:'Q736',  bo:'Q750',  py:'Q733',  uy:'Q77',
    // أفريقيا جنوب الصحراء
    ng:'Q1033', et:'Q115',  ke:'Q114',  tz:'Q924',  za:'Q258',
    gh:'Q117',  sn:'Q1041', ci:'Q1008', cm:'Q1009', ml:'Q912',
    mr:'Q1025', td:'Q657',  ne:'Q1032', so:'Q1045', ug:'Q1036',
    // أوقيانوسيا
    au:'Q408',  nz:'Q664',  pg:'Q691',  fj:'Q712',
};

function wikidataFetch(sparql) {
    if (!circuitAllow('wikidata')) {
        return Promise.reject(new Error('circuit_open:wikidata'));
    }
    return new Promise((resolve, reject) => {
        const encoded = encodeURIComponent(sparql);
        const req = https.request({
            hostname: 'query.wikidata.org',
            path: `/sparql?query=${encoded}&format=json`,
            method: 'GET',
            headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'PrayerTimesApp/1.0' },
            timeout: 25000,
        }, res => {
            if (res.statusCode !== 200) { res.resume(); circuitFail('wikidata'); return reject(new Error(`HTTP ${res.statusCode}`)); }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', c => data += c);
            res.on('end', () => { try { circuitSuccess('wikidata'); resolve(JSON.parse(data)); } catch(e) { circuitFail('wikidata'); reject(e); } });
        });
        req.on('error', (e) => { circuitFail('wikidata'); reject(e); });
        req.on('timeout', () => { req.destroy(); circuitFail('wikidata'); reject(new Error('timeout')); });
        req.end();
    });
}

async function fetchCitiesWikidata(cc) {
    const qid = COUNTRY_QID[cc];
    // إذا لم يكن QID موجوداً نستعلم بكود ISO مباشرةً (يعمل مع أي دولة)
    const countryFilter = qid
        ? `?item wdt:P17 wd:${qid};`
        : `?country wdt:P297 "${cc.toUpperCase()}". ?item wdt:P17 ?country;`;
    // نجلب السكان (P1082) لترتيب المدن الكبرى أولاً
    const sparql = `SELECT ?nameAr ?nameEn ?lat ?lng (MAX(?popVal) AS ?pop) WHERE {
  VALUES ?type { wd:Q515 wd:Q3957 wd:Q532 wd:Q1549591 }
  ${countryFilter} wdt:P31 ?type;
        p:P625/psv:P625 [ wikibase:geoLatitude ?lat; wikibase:geoLongitude ?lng ].
  OPTIONAL { ?item rdfs:label ?nameAr FILTER(LANG(?nameAr)="ar") }
  OPTIONAL { ?item rdfs:label ?nameEn FILTER(LANG(?nameEn)="en") }
  OPTIONAL { ?item wdt:P1082 ?popVal }
  FILTER(BOUND(?nameAr) || BOUND(?nameEn))
} GROUP BY ?nameAr ?nameEn ?lat ?lng
LIMIT 2000`;
    try {
        const r = await wikidataFetch(sparql);
        const seen = new Set();
        const cities = (r?.results?.bindings || [])
            .map(b => ({
                nameAr: b.nameAr?.value || b.nameEn?.value || '',
                nameEn: b.nameEn?.value || '',
                type: 'city',
                lat: parseFloat(b.lat?.value),
                lng: parseFloat(b.lng?.value),
                pop: b.pop?.value ? parseInt(b.pop.value) : null,
            }))
            .filter(c => c.nameAr && !isNaN(c.lat) && !seen.has(c.nameAr) && seen.add(c.nameAr));
        return sortWithCapitalFirst(cities, cc);
    } catch(e) { console.log(`[Wikidata] ${e.message}`); return null; }
}

// ===== قاعدة البيانات الدائمة =====
function dbFile(cc) {
    return path.join(DB_DIR, `cities-${cc}.json`);
}

// كاش مدن في الذاكرة — أول قراءة تقرأ من القرص، الباقي من الذاكرة
// الكتابات تتم عبر dbWrite الذي يحدّث الكاش، فلا يتقادم المحتوى في الاستخدام العادي
const _dbMemCache = new Map();

function dbRead(cc) {
    const cached = _dbMemCache.get(cc);
    if (cached !== undefined) return cached;
    try {
        const raw = fs.readFileSync(dbFile(cc), 'utf8');
        const data = JSON.parse(raw);
        _dbMemCache.set(cc, data);
        return data;
    } catch(e) {
        _dbMemCache.set(cc, null);
        return null;
    }
}

function dbWrite(cc, cities) {
    try {
        fs.writeFileSync(dbFile(cc), JSON.stringify(cities, null, 2), 'utf8');
        _dbMemCache.set(cc, cities);
        invalidateSitemapCache();
        return true;
    } catch(e) { console.error(`[DB] خطأ في الكتابة ${cc}:`, e.message); return false; }
}

// دمج مدن جديدة في قاعدة البيانات بدون حذف القديمة
function dbMerge(cc, newCities) {
    const existing = dbRead(cc) || [];
    const merged = deduplicateCities([...existing, ...newCities]);
    const added  = merged.length - existing.length;
    dbWrite(cc, merged);
    return { total: merged.length, added };
}

// ===== معالج GET /api/cities =====
async function handleCitiesApi(cc, res) {
    if (!/^[a-z]{2,3}$/.test(cc)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid cc'})); return;
    }

    // 1) قاعدة البيانات الدائمة — المصدر الأول دائماً
    const stored = dbRead(cc);
    if (stored && stored.length > 0) {
        const result = sortWithCapitalFirst(deduplicateCities(stored), cc);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'db'});
        res.end(JSON.stringify(result));

        // في الخلفية: إذا البيانات الثابتة أكبر، ادمجها في DB
        const staticData = STATIC_CITIES[cc];
        if (staticData && staticData.length > stored.length) {
            setImmediate(() => {
                const r = dbMerge(cc, staticData);
                if (r.added > 0) console.log(`[DB] ${cc.toUpperCase()} → أُضيف ${r.added} من البيانات الثابتة`);
            });
        }
        return;
    }

    // 2) لا توجد في DB → ابدأ بالبيانات الثابتة فوراً وأحضر Wikidata في الخلفية
    const staticData = STATIC_CITIES[cc];
    if (staticData && staticData.length > 0) {
        const initial = sortWithCapitalFirst(deduplicateCities([...staticData]), cc);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'static'});
        res.end(JSON.stringify(initial));
        console.log(`[DB] ${cc.toUpperCase()} → ${initial.length} مدينة من البيانات الثابتة (أول مرة)`);

        // احفظ في DB وحدّث من Wikidata
        dbWrite(cc, initial);
        fetchCitiesWikidata(cc).then(wiki => {
            if (wiki && wiki.length > 0) {
                const r = dbMerge(cc, wiki);
                console.log(`[DB] ${cc.toUpperCase()} → حُدّث من Wikidata: ${r.total} مدينة (+${r.added})`);
            }
        }).catch(() => {});
        return;
    }

    // 3) لا بيانات ثابتة → جلب من Wikidata مباشرة
    console.log(`[DB] ${cc.toUpperCase()} → جلب من Wikidata...`);
    const wiki = await fetchCitiesWikidata(cc);
    if (!wiki || wiki.length === 0) {
        // 4) Wikidata فشلت → fallback: العاصمة فقط (من CAPITAL_DATA) لضمان عدم فراغ الصفحة
        const capital = CAPITAL_DATA[cc];
        if (capital) {
            const fallback = [{ ...capital, type: 'city' }];
            console.log(`[DB] ${cc.toUpperCase()} → Wikidata فشلت، عرض العاصمة كـ fallback`);
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'capital-fallback'});
            res.end(JSON.stringify(fallback));
            // جرّب Wikidata مرة أخرى في الخلفية بعد 30 ثانية
            setTimeout(() => {
                fetchCitiesWikidata(cc).then(w => {
                    if (w && w.length > 0) {
                        dbWrite(cc, deduplicateCities(w));
                        console.log(`[DB] ${cc.toUpperCase()} → حُدّث من Wikidata (محاولة ثانية): ${w.length} مدينة`);
                    }
                }).catch(() => {});
            }, 30000);
        } else {
            res.writeHead(503, {'Content-Type':'application/json'});
            res.end(JSON.stringify({error:'unavailable'}));
        }
        return;
    }
    const result = deduplicateCities(wiki);
    dbWrite(cc, result);
    console.log(`[DB] ${cc.toUpperCase()} → ${result.length} مدينة من Wikidata وحُفظت في DB`);
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8', 'X-Source':'wikidata'});
    res.end(JSON.stringify(sortWithCapitalFirst(result, cc)));
}

// ===== معالج POST /api/cities/add — إضافة مدن جديدة من العميل =====
async function handleCitiesAdd(cc, body, res) {
    if (!/^[a-z]{2,3}$/.test(cc)) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid cc'})); return;
    }
    let newCities;
    try { newCities = JSON.parse(body); } catch(e) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'invalid json'})); return;
    }
    if (!Array.isArray(newCities) || newCities.length === 0) {
        res.writeHead(400, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'empty array'})); return;
    }
    const r = dbMerge(cc, newCities);
    console.log(`[DB] ${cc.toUpperCase()} → أُضيف ${r.added} مدينة جديدة (الإجمالي: ${r.total})`);
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({ ok: true, added: r.added, total: r.total }));
}

// ===== HTTP Server =====
const server = http.createServer(async (req, res) => {
    // Security Headers — تُطبَّق على كل استجابة
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=()');
    // HSTS: 2 سنوات + includeSubDomains + preload (يحلّ "No HSTS" warning في Seobility/SEOptimer)
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // CSP — يحمي من XSS ويرفع Security grade. القائمة تطابق المصادر الخارجية المستخدمة فعلياً.
    // ملاحظة: 'unsafe-inline' ضروري للـ inline scripts الموجودة في index.html وللـ inline SSR CSS.
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https://flagcdn.com https://*.tile.openstreetmap.org",
        "connect-src 'self' https://api.open-meteo.com https://nominatim.openstreetmap.org https://api.mymemory.translated.net https://overpass-api.de https://restcountries.com https://ar.wikipedia.org https://en.wikipedia.org",
        "media-src 'self' https://cdn.islamic.network",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join('; '));
    res.setHeader('X-XSS-Protection', '0'); // modern browsers ignore — CSP أفضل

    // 301 redirect: www.* → * (يُصلح duplicate content warning في SEO audits)
    // ملاحظة: Render (*.onrender.com) ليس فيه www variant فالميدلوير خامل عملياً،
    // لكنه ضروري لحظة ربط custom domain لاحقاً ويزيل warning من أدوات الفحص.
    const _hostHdr = (req.headers.host || '').toLowerCase();
    if (_hostHdr.startsWith('www.')) {
        const _target = 'https://' + _hostHdr.slice(4) + req.url;
        res.writeHead(301, { 'Location': _target, 'Cache-Control': 'public, max-age=31536000' });
        res.end();
        return;
    }

    let urlPath = req.url.split('?')[0];
    const qs    = req.url.includes('?') ? req.url.split('?')[1] : '';

    // Rate Limit متدرّج على /api/* فقط
    if (urlPath.startsWith('/api/')) {
        const ip   = getClientIp(req);
        const tier = getTierForPath(urlPath);
        const rl   = checkRateLimit(ip, tier);
        res.setHeader('X-RateLimit-Limit', String(rl.max));
        res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
        res.setHeader('X-RateLimit-Reset', String(rl.reset));
        res.setHeader('X-RateLimit-Tier', tier);
        if (!rl.allowed) {
            res.writeHead(429, {'Content-Type':'application/json; charset=utf-8', 'Retry-After': String(rl.reset)});
            res.end(JSON.stringify({ error: 'rate_limited', tier, retryAfter: rl.reset }));
            return;
        }
    }

    if (urlPath === '/index.html') {
        res.writeHead(301, {'Location': '/' + (qs ? '?'+qs : '')});
        res.end(); return;
    }
    if (urlPath === '/') urlPath = '/index.html';

    // ===== SEO: Redirect روابط الدول القديمة /prayer-times-cities-{slug} → /{slug} (301) =====
    {
        const _legacyCountry = urlPath.match(/^(\/(?:en\/)?)prayer-times-cities-([a-z0-9-]+?)(?:\.html)?$/);
        if (_legacyCountry) {
            res.writeHead(301, { 'Location': _legacyCountry[1] + _legacyCountry[2], 'Cache-Control': 'public, max-age=31536000' });
            res.end(); return;
        }
    }

    // ===== SEO: 301 redirect من /zakat (+ بادئات اللغات) → /zakat-calculator =====
    {
        const _oldZakatMatch = urlPath.match(/^\/((?:en|fr|tr|ur|de|id|es|bn|ms)\/)?zakat\/?$/);
        if (_oldZakatMatch) {
            const _prefix = _oldZakatMatch[1] || '';
            res.writeHead(301, { 'Location': `/${_prefix}zakat-calculator`, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== SEO: Redirect روابط .html الديناميكية → روابط نظيفة (301) =====
    if (urlPath !== '/index.html' && urlPath.endsWith('.html')) {
        const _clean = urlPath.replace(/\.html$/, '');
        if (/^\/(?:en\/)?(?:prayer-times-in-|qibla-in-|about-[a-z0-9]|msbaha$|today-hijri-date$|dateconverter$|hijri-date\/\d+-[a-z-]+-\d+$|hijri-calendar\/[a-z-]+-\d+$)/.test(_clean)) {
            res.writeHead(301, { 'Location': _clean, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== robots.txt =====
    if (urlPath === '/robots.txt') {
        const body = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
        res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'public, max-age=86400'});
        res.end(body);
        return;
    }

    // ===== ads.txt — Google AdSense Authorized Sellers =====
    if (urlPath === '/ads.txt') {
        fs.readFile(path.join(ROOT, 'ads.txt'), (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end('# ads.txt not configured yet\n');
                return;
            }
            res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'public, max-age=86400'});
            res.end(data);
        });
        return;
    }

    // ===== مساعدات Sitemap =====
    function escapeXml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
    }

    // إرسال XML مع دعم gzip عند توفر Accept-Encoding
    function sendXml(res, xml, acceptEnc, forceGzip) {
        const headers = {
            'Content-Type':'application/xml; charset=utf-8',
            'Cache-Control':'public, max-age=3600',
            'Vary':'Accept-Encoding'
        };
        const buf = Buffer.from(xml, 'utf8');
        const useGzip = forceGzip || (acceptEnc && acceptEnc.includes('gzip'));
        if (useGzip) {
            zlib.gzip(buf, (err, zbuf) => {
                if (err) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding':'gzip' });
                res.end(zbuf);
            });
        } else {
            res.writeHead(200, headers);
            res.end(buf);
        }
    }

    // ===== Sitemap: توليد بيانات المدن (مع cache) =====
    function buildSitemapDataFresh() {
        const countryCodes = new Set([
            ...Object.keys(STATIC_CITIES),
            ...Object.keys(CAPITAL_DATA),
        ]);
        try {
            fs.readdirSync(DB_DIR).forEach(f => {
                const m = f.match(/^cities-([a-z]{2,3})\.json$/);
                if (m) countryCodes.add(m[1]);
            });
        } catch(e) {}

        const allCities = [];
        for (const cc of countryCodes) {
            let cities = [];
            const dbData = dbRead(cc);
            if (dbData && dbData.length) cities = dbData;
            else if (STATIC_CITIES[cc]) cities = STATIC_CITIES[cc];
            else if (CAPITAL_DATA[cc]) cities = [CAPITAL_DATA[cc]];
            for (const city of cities) {
                const slug = makeCitySlugSrv(city.nameEn, city.lat, city.lng);
                if (slug) allCities.push(slug);
            }
        }
        return { countryCodes: [...countryCodes], cities: [...new Set(allCities)] };
    }

    function getSitemapData() {
        const now = Date.now();
        if (_sitemapCache.data && (now - _sitemapCache.time) < SITEMAP_TTL) {
            return _sitemapCache.data;
        }
        const data = buildSitemapDataFresh();
        _sitemapCache = { data, time: now };
        return data;
    }

    // مولّد URL متعدد اللغات (10 لغات) مع hreflang
    function bilingualUrl(relPath, prio, cf, today) {
        const langs = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
        const urls = {};
        for (const l of langs) {
            const prefix = (l === 'ar') ? '' : ('/' + l);
            urls[l] = escapeXml(SITE_URL + prefix + relPath);
        }
        const links = langs.map(l =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${urls[l]}"/>`
        ).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urls.ar}"/>`;
        const body = (loc) =>
            `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${prio}</priority>\n${links}\n  </url>`;
        return langs.map(l => body(urls[l]));
    }

    const URLSET_OPEN = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
    const URLSET_CLOSE = `</urlset>\n`;

    // ===== /sitemap.xml (أو .xml.gz) = فهرس Sitemaps =====
    {
        const mi = urlPath.match(/^\/sitemap\.xml(\.gz)?$/);
        if (mi) {
            const today = new Date().toISOString().split('T')[0];
            const { cities } = getSitemapData();
            const CHUNK_SIZE = 8000;
            const chunkCount = Math.max(1, Math.ceil(cities.length / CHUNK_SIZE));
            const sitemaps = [];
            sitemaps.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-main.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
            for (let i = 0; i < chunkCount; i++) {
                sitemaps.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-cities-${i+1}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
            }
            const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.join('\n')}\n</sitemapindex>\n`;
            sendXml(res, xml, req.headers['accept-encoding']||'', !!mi[1]);
            return;
        }
    }

    // ===== /sitemap-main.xml = الصفحات الثابتة + الدول + التقويم الهجري =====
    {
        const mm = urlPath.match(/^\/sitemap-main\.xml(\.gz)?$/);
        if (mm) {
            const today = new Date().toISOString().split('T')[0];
            const entries = [];

            // 1) الصفحات الثابتة (AR + EN مع hreflang)
            const staticPaths = [
                ['/', '1.0', 'daily'],
                ['/qibla', '0.9', 'monthly'],
                ['/moon', '0.8', 'daily'],
                ['/zakat-calculator', '0.8', 'monthly'],
                ['/duas', '0.8', 'monthly'],
                ['/msbaha', '0.7', 'monthly'],
                ['/dateconverter', '0.8', 'monthly'],
                ['/today-hijri-date', '0.9', 'daily'],
                ['/prayer-times-worldwide', '0.9', 'weekly'],
                ['/about-us', '0.6', 'monthly'],
                ['/contact', '0.5', 'monthly'],
                ['/privacy', '0.4', 'yearly'],
                ['/terms', '0.4', 'yearly'],
            ];
            for (const [p, pr, cf] of staticPaths) {
                entries.push(...bilingualUrl(p, pr, cf, today));
            }

            // 2) صفحات الدول (نمط موحَّد مع المدن: /prayer-times-in-{slug})
            const { countryCodes } = getSitemapData();
            for (const cc of countryCodes) {
                const slug = makeCountrySlugSrv(cc);
                entries.push(...bilingualUrl('/prayer-times-in-' + slug, '0.8', 'weekly', today));
            }

            // 3) التقويم الهجري — 3 سنوات (سنوي + شهري)
            const hijriMonths = ['muharram','safar','rabi-al-awwal','rabi-al-thani','jumada-al-awwal','jumada-al-thani','rajab','shaban','ramadan','shawwal','dhu-al-qadah','dhu-al-hijjah'];
            const gYear = new Date().getFullYear();
            const hYearApprox = Math.round((gYear - 622) * 33 / 32);
            for (const hy of [hYearApprox - 1, hYearApprox, hYearApprox + 1]) {
                entries.push(...bilingualUrl('/hijri-calendar/' + hy, '0.7', 'monthly', today));
                for (const m of hijriMonths) {
                    entries.push(...bilingualUrl(`/hijri-calendar/${m}-${hy}`, '0.6', 'monthly', today));
                }
            }

            // 4) صفحات اليوم الهجري — السنة الحالية فقط (12 شهر × 30 يوم × 2 لغة = ~720)
            for (let mi = 0; mi < hijriMonths.length; mi++) {
                const m = hijriMonths[mi];
                for (let d = 1; d <= 30; d++) {
                    entries.push(...bilingualUrl(`/hijri-date/${d}-${m}-${hYearApprox}`, '0.4', 'yearly', today));
                }
            }

            const xml = `${URLSET_OPEN}\n${entries.join('\n')}\n${URLSET_CLOSE}`;
            sendXml(res, xml, req.headers['accept-encoding']||'', !!mm[1]);
            return;
        }
    }

    // ===== /sitemap-cities-N.xml = chunk المدن (6 URLs × مدينة مع hreflang) =====
    {
        const mc = urlPath.match(/^\/sitemap-cities-(\d+)\.xml(\.gz)?$/);
        if (mc) {
            const idx = parseInt(mc[1], 10) - 1;
            const today = new Date().toISOString().split('T')[0];
            const { cities } = getSitemapData();
            const CHUNK_SIZE = 8000;
            const chunk = cities.slice(idx * CHUNK_SIZE, (idx + 1) * CHUNK_SIZE);
            if (chunk.length === 0) {
                res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found'); return;
            }
            const entries = [];
            for (const slug of chunk) {
                entries.push(...bilingualUrl('/prayer-times-in-' + slug, '0.7', 'daily', today));
                entries.push(...bilingualUrl('/qibla-in-' + slug, '0.6', 'monthly', today));
                entries.push(...bilingualUrl('/about-' + slug, '0.5', 'monthly', today));
            }
            const xml = `${URLSET_OPEN}\n${entries.join('\n')}\n${URLSET_CLOSE}`;
            sendXml(res, xml, req.headers['accept-encoding']||'', !!mc[2]);
            return;
        }
    }


    // ===== مساعد: تعديل HTML للنسخة الإنجليزية وإرساله =====
    function serveEnglishHtml(htmlBuf, res, acceptEnc) {
        let html = htmlBuf.toString('utf8');
        // 1) تغيير lang وdir في <html> لمنع CLS (RTL→LTR shift)
        html = html.replace(/<html([^>]*)\blang="ar"([^>]*)\bdir="rtl"/,
                            '<html$1lang="en"$2dir="ltr"');
        // 2) حقن <base href="/"> قبل أي رابط لكي يحله preload scanner بشكل صحيح
        html = html.replace('<head>', '<head>\n    <base href="/">');
        const buf = Buffer.from(html, 'utf8');
        const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'Vary': 'Accept-Encoding' };
        if (acceptEnc.includes('gzip')) {
            zlib.gzip(buf, (e, zbuf) => {
                if (e) { res.writeHead(200, headers); res.end(buf); return; }
                res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
                res.end(zbuf);
            });
        } else {
            res.writeHead(200, headers);
            res.end(buf);
        }
    }

    const _acceptEnc = req.headers['accept-encoding'] || '';

    // ===== /og-image.svg — dynamic OG image endpoint =====
    if (urlPath === '/og-image.svg') { handleOgImage(qs, res); return; }

    // ===== الصفحة الرئيسية /index.html (remapped من /) — SSR SEO =====
    if (urlPath === '/index.html') {
        readCachedFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, '/', res, _acceptEnc);
        });
        return;
    }

    // ===== HTML pages served from index.html (SSR SEO injection) =====
    // يدعم: ar (افتراضي بدون prefix)، en، fr، tr، ur
    const _LANG_PREFIX_RE = '(?:en|fr|tr|ur|de|id|es|bn|ms)';
    const _isIndexHtmlRoute =
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?dateconverter$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?today-hijri-date$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?msbaha$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?zakat-calculator$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?duas$/.test(urlPath) ||
        /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/?$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar(?:\/\d{4})?$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-calendar\/[a-z-]+-\d+$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?hijri-date\/\d+-[a-z-]+-\d+$/.test(urlPath) ||
        // ملاحظة: /prayer-times-in-* (لكل اللغات) يُخدَم لاحقاً من الـ route الموحَّد
        // عند السطر ~4224 — حيث يُفحَص الـ slug للتمييز بين دولة (prayer-times-cities.html)
        // ومدينة (index.html). لا نُدرجه هنا لئلا نفرض index.html على جميع الحالات.
        /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?qibla-in-.+(?:\.html)?$/.test(urlPath);

    if (_isIndexHtmlRoute) {
        readCachedFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
    }

    // ===== Legal pages: /privacy, /terms, /contact, /about-us (+ /en/...) =====
    {
        const _legalMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?(privacy|terms|contact|about-us)$/);
        if (_legalMatch) {
            const urlLang = _legalMatch[1] || 'ar';
            const slug = _legalMatch[2];
            const isEn = (urlLang === 'en');
            // استخدم اللغة من الـ URL مباشرة، ارجع إلى الإنجليزية ثم العربية كاحتياطي
            const pageData = LEGAL_PAGES[slug] || {};
            const content = pageData[urlLang] || pageData.en || pageData.ar || '';
            const isRtl = (urlLang === 'ar' || urlLang === 'ur');
            readCachedFile(path.join(ROOT, 'legal.html'), (err, html) => {
                if (err) { res.writeHead(404); res.end('Not Found'); return; }
                // Inject content placeholder
                let htmlStr = html.toString('utf8').replace('{{LEGAL_CONTENT}}', content);
                // Set lang/dir attributes
                const dir = isRtl ? 'rtl' : 'ltr';
                htmlStr = htmlStr.replace('<html lang="ar" dir="rtl">', `<html lang="${urlLang}" dir="${dir}">`);
                serveHtmlWithSeo(Buffer.from(htmlStr, 'utf8'), urlPath, res, _acceptEnc);
            });
            return;
        }
    }

    // ===== about-* pages (about-city.html) =====
    if (/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?about-.+$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'about-city.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
    }

    // ===== صفحة كل دول العالم: /prayer-times-worldwide + /{lang}/prayer-times-worldwide =====
    // يجب أن تأتي قبل route الـ /{country-slug} لضمان عدم الوقوع في أي نمط عام
    if (/^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-worldwide$/.test(urlPath)) {
        serveCountriesPage(urlPath, res, _acceptEnc);
        return;
    }

    // ===== 301 redirect دائم: /countries (+ /{lang}/countries) → /prayer-times-worldwide =====
    // للحفاظ على روابط خارجيّة/bookmarks قديمة دون فقدان SEO
    {
        const _oldCountriesMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?countries$/);
        if (_oldCountriesMatch) {
            const _lg = _oldCountriesMatch[1] || '';
            const _newUrl = (_lg ? '/' + _lg : '') + '/prayer-times-worldwide';
            res.writeHead(301, { 'Location': _newUrl, 'Cache-Control': 'public, max-age=31536000' });
            res.end();
            return;
        }
    }

    // ===== نمط موحَّد: /prayer-times-in-{slug} يُستخدم لدولة أو مدينة =====
    // AR: /prayer-times-in-saudi-arabia | EN: /en/prayer-times-in-saudi-arabia
    // AR: /prayer-times-in-cairo        | EN: /en/prayer-times-in-cairo
    // الفحص: إذا كان الـ slug يطابق دولة معروفة → cities listing (country page)
    // وإلا → صفحة المدينة (index.html مع SSR للمدينة).
    {
        // نقبل النقاط في الـ slug لتمرير روابط "loc-{lat}.{d}n-{lng}.{d}e" للمدن بأسماء غير لاتينية
        const _ptMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?prayer-times-in-([a-z][a-z0-9.-]+)$/);
        if (_ptMatch) {
            const slug = _ptMatch[2];
            const countryCheck = _countryFromSlug(slug);
            const isCountry = countryCheck && countryCheck.cc && countryCheck.cc !== '__';
            const htmlFile = isCountry ? 'prayer-times-cities.html' : 'index.html';
            readCachedFile(path.join(ROOT, htmlFile), (err, html) => {
                if (err) { res.writeHead(404); res.end('Not Found'); return; }
                serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
            });
            return;
        }
    }

    // ===== 301 redirect: /{old-country-slug} → /prayer-times-in-{slug} =====
    // defensive: روابط خارجية/bookmarks قديمة — نحوّلها للنمط الجديد بدون فقدان SEO.
    // يُفحَص أن الـ slug يطابق دولة قبل الـ redirect (غير دول → يستكمل للـ routes التالية).
    {
        const _oldCountryMatch = urlPath.match(/^\/(?:(en|fr|tr|ur|de|id|es|bn|ms)\/)?([a-z][a-z0-9-]+)$/);
        const _oldReserved = new Set(['qibla','moon','zakat-calculator','duas','msbaha',
            'dateconverter','today-hijri-date','privacy','terms','contact','about-us',
            'prayer-times-worldwide','index']);
        if (_oldCountryMatch && !_oldReserved.has(_oldCountryMatch[2])) {
            const _oldCountry = _countryFromSlug(_oldCountryMatch[2]);
            if (_oldCountry && _oldCountry.cc && _oldCountry.cc !== '__') {
                const _oldLang = _oldCountryMatch[1] || '';
                const _newUrl = (_oldLang ? '/' + _oldLang : '') + '/prayer-times-in-' + _oldCountryMatch[2];
                res.writeHead(301, {
                    'Location': _newUrl,
                    'Cache-Control': 'public, max-age=31536000'
                });
                res.end();
                return;
            }
        }
    }

    // ===== Nominatim Proxy (يحل مشكلة CORS + rate limit) =====
    if (urlPath === '/api/geocode' && req.method === 'GET') {
        const typeMatch = qs.match(/(?:^|&)type=([^&]+)/);
        const type = typeMatch ? typeMatch[1] : 'search';
        const cleanQs = qs.replace(/(?:^|&)type=[^&]+/, '').replace(/^&/, '');
        const cacheKey = `${type}?${cleanQs}`;

        // تحقق من الكاش أولاً
        const cached = _geocodeCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < _GEOCACHE_TTL) {
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
            res.end(cached.data);
            return;
        }

        // Circuit breaker check
        if (!circuitAllow('nominatim')) {
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('[]'); return;
        }

        const nominatimUrl = `https://nominatim.openstreetmap.org/${type}?${cleanQs}`;
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 6000);
            const nomRes = await fetch(nominatimUrl, {
                signal: ctrl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 PrayerTimesApp/1.0', 'Accept': 'application/json' }
            });
            clearTimeout(timer);
            if (nomRes.status === 429 || nomRes.status >= 500) {
                circuitFail('nominatim');
                res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
                res.end('[]'); return;
            }
            const data = await nomRes.text();
            if (data.trim().startsWith('[') || data.trim().startsWith('{')) {
                _geocodeCache.set(cacheKey, { ts: Date.now(), data });
            }
            circuitSuccess('nominatim');
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600'});
            res.end(data.trim().startsWith('[') || data.trim().startsWith('{') ? data : '[]');
        } catch(e) {
            circuitFail('nominatim');
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('[]');
        }
        return;
    }

    // ===== Wikipedia Hijri On This Day Proxy =====
    if (urlPath === '/api/wiki-onthisday' && req.method === 'GET') {
        const params  = new URLSearchParams(qs);
        const day     = parseInt(params.get('day'))   || 1;
        const month   = decodeURIComponent(params.get('month') || '');
        const _WIKI_TTL = 24 * 60 * 60 * 1000;
        const cacheKey  = `wiki-hijri-${day}-${month}`;

        const cached = _geocodeCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < _WIKI_TTL) {
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
            res.end(cached.data); return;
        }

        // Circuit breaker check
        if (!circuitAllow('wikipedia')) {
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('{"events":[]}'); return;
        }

        // صفحة اليوم الهجري في ويكيبيديا العربية مثل "26 شوال"
        const pageTitle = encodeURIComponent(`${day} ${month}`);
        const wikiUrl = `https://ar.wikipedia.org/w/api.php?action=parse&page=${pageTitle}&prop=wikitext&format=json&origin=*`;
        try {
            const ctrl  = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 8000);
            const wRes  = await fetch(wikiUrl, { signal: ctrl.signal, headers: { 'User-Agent': 'PrayerTimesApp/1.0', 'Accept': 'application/json' } });
            clearTimeout(timer);
            if (!wRes.ok) {
                if (wRes.status >= 500 || wRes.status === 429) circuitFail('wikipedia');
                res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}); res.end('{"events":[]}'); return;
            }
            const json = await wRes.json();
            const wikitext = json?.parse?.wikitext?.['*'] || '';

            // استخراج اسم مقالة الشخص (تجاهل روابط السنة)
            const extractFirstArticle = raw => {
                const re = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
                let m;
                while ((m = re.exec(raw)) !== null) {
                    const name = m[1].trim();
                    // تجاهل روابط السنة الهجرية أو الميلادية
                    if (/^\d{1,4}\s*هـ$/.test(name) || /^\d{4}$/.test(name)) continue;
                    return name;
                }
                return null;
            };
            const cleanWiki = t => t
                .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
                .replace(/\{\{[^}]*\}\}/g, '')
                .replace(/<[^>]+>/g, '')
                .replace(/'{2,}/g, '')
                .trim();
            const TARGET_SECTIONS = { 'أحداث': 'أحداث', 'مواليد': 'مواليد', 'وفيات': 'وفيات' };
            const events = [];
            let currentType = null;
            for (const line of wikitext.split('\n')) {
                const secHeader = line.match(/^==\s*([^=]+?)\s*==\s*$/);
                if (secHeader) {
                    currentType = TARGET_SECTIONS[secHeader[1].trim()] || null;
                    continue;
                }
                if (!currentType) continue;
                const bullet = line.match(/^\*+\s*(.*)/);
                if (!bullet) continue;
                const raw  = bullet[1];
                const text = cleanWiki(raw);
                if (text.length <= 10) continue;
                const ev = { text, type: currentType };
                // للمواليد والوفيات: احفظ اسم المقالة لجلب تفاصيل الشخص
                if (currentType === 'مواليد' || currentType === 'وفيات') {
                    const article = extractFirstArticle(raw);
                    if (article) ev.article = article;
                }
                events.push(ev);
            }
            const data = JSON.stringify({ events });
            _geocodeCache.set(cacheKey, { ts: Date.now(), data });
            circuitSuccess('wikipedia');
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
            res.end(data);
        } catch(e) {
            circuitFail('wikipedia');
            res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('{"events":[]}');
        }
        return;
    }

    // ===== Wikipedia Person/City Summary Proxy =====
    if (urlPath === '/api/wiki-summary' && req.method === 'GET') {
        const params = new URLSearchParams(qs);
        const title = decodeURIComponent(params.get('title') || '').trim();
        const langRaw = (params.get('lang') || 'ar').trim().toLowerCase();
        const _WIKI_LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
        const lang = _WIKI_LANGS.includes(langRaw) ? langRaw : 'ar';
        if (!title) { res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}); res.end('{}'); return; }
        const cacheKey = `wiki-summary-${lang}-${title}`;
        const _SUMMARY_TTL = 7 * 24 * 60 * 60 * 1000; // 7 أيام
        const cached = _geocodeCache.get(cacheKey);
        if (cached && (Date.now() - cached.ts) < _SUMMARY_TTL) {
            res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=86400'});
            res.end(cached.data); return;
        }
        // Circuit breaker check
        if (!circuitAllow('wikipedia')) {
            res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}); res.end('{}'); return;
        }
        try {
            const wUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            const wRes = await fetch(wUrl, { headers: { 'User-Agent': 'PrayerTimesApp/1.0' } });
            if (!wRes.ok) {
                if (wRes.status >= 500 || wRes.status === 429) circuitFail('wikipedia');
                res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}); res.end('{}'); return;
            }
            const json = await wRes.json();
            const out = JSON.stringify({
                extract: json.extract || '',
                description: json.description || '',
                title: json.title || title,
                url: (json.content_urls && json.content_urls.desktop && json.content_urls.desktop.page) || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                lang
            });
            _geocodeCache.set(cacheKey, { ts: Date.now(), data: out });
            circuitSuccess('wikipedia');
            res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=86400'});
            res.end(out);
        } catch(e) {
            circuitFail('wikipedia');
            res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
            res.end('{}');
        }
        return;
    }

    if (urlPath === '/api/cities' && req.method === 'GET') {
        const cc = (new URLSearchParams(qs)).get('cc') || '';
        await handleCitiesApi(cc.toLowerCase(), res);
        return;
    }

    if (urlPath === '/api/cities/add' && (req.method === 'POST' || req.method === 'OPTIONS')) {
        // دعم CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
        const cc = (new URLSearchParams(qs)).get('cc') || '';
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => handleCitiesAdd(cc.toLowerCase(), body.trim(), res));
        return;
    }

    // صفحة عن المدينة: /about-{slug}
    if (/^\/about-.+$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'about-city.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            res.end(html);
        });
        return;
    }

    // ملاحظة: routes المدن + الدول العربية تُخدَم الآن من الـ route الموحَّد
    // /prayer-times-in-{slug} أعلى في الملفّ (يفرِّق بين دولة ومدينة عبر _countryFromSlug).
    // الـ route الجذري /{slug} تم حذفه لصالح الـ 301 redirect في الأعلى.

    const filePath    = path.join(ROOT, urlPath);
    const ext         = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const compressible = ['.js', '.css', '.html', '.json', '.svg', '.xml'].includes(ext);
    const isVersioned  = req.url.includes('?v=');
    const isServiceWorker = urlPath === '/sw.js';
    // ملفات وسائط ثابتة (أذان، أيقونات...) لا تتغير — 1 سنة
    const isLongLivedAsset = ['.mp3', '.ogg', '.wav', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(ext);
    const cacheControl = isServiceWorker
        ? 'no-cache, no-store, must-revalidate'
        : isVersioned || isLongLivedAsset
        ? 'public, max-age=31536000, immutable'
        : ext === '.html' ? 'no-cache' : 'public, max-age=86400';

    // محاولة التقديم من كاش الذاكرة أولاً (للملفات التي حُمّلت عند الإقلاع)
    const _cachedStatic = _staticCache.get(filePath);
    if (_cachedStatic) {
        const _acceptEncStatic = req.headers['accept-encoding'] || '';
        // Brotli أفضل ~15-25% من gzip — نُفضّله عند دعمه
        if (compressible && _acceptEncStatic.includes('br') && _cachedStatic.brotli) {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Encoding': 'br',
                'Content-Length': _cachedStatic.brotli.length,
                'Cache-Control': cacheControl,
                'Vary': 'Accept-Encoding',
            });
            res.end(_cachedStatic.brotli);
        } else if (compressible && _acceptEncStatic.includes('gzip') && _cachedStatic.gzipped) {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Encoding': 'gzip',
                'Content-Length': _cachedStatic.gzipped.length,
                'Cache-Control': cacheControl,
                'Vary': 'Accept-Encoding',
            });
            res.end(_cachedStatic.gzipped);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': _cachedStatic.data.length,
                'Cache-Control': cacheControl,
                'Accept-Ranges': 'bytes',
            });
            res.end(_cachedStatic.data);
        }
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (!ext || ext === '.html') {
                readCachedFile(path.join(ROOT, 'index.html'), (err2, html) => {
                    if (err2) { res.writeHead(404); res.end('Not Found'); return; }
                    serveHtmlWithSeo(html, urlPath, res, req.headers['accept-encoding'] || '');
                });
            } else {
                res.writeHead(404, {'Content-Type':'text/plain'});
                res.end('Not Found');
            }
            return;
        }

        const acceptEnc = req.headers['accept-encoding'] || '';
        if (compressible && acceptEnc.includes('gzip')) {
            zlib.gzip(data, (e, buf) => {
                if (e) {
                    res.writeHead(200, {'Content-Type': contentType, 'Content-Length': data.length, 'Cache-Control': cacheControl});
                    res.end(data);
                    return;
                }
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Encoding': 'gzip',
                    'Cache-Control': cacheControl,
                    'Vary': 'Accept-Encoding',
                });
                res.end(buf);
            });
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Cache-Control': cacheControl,
                'Accept-Ranges': 'bytes',
            });
            res.end(data);
        }
    });
});

_preloadReady.then(() => {
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('[FATAL] preload failed, starting anyway:', err);
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
