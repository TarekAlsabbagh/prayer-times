const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');

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
const _preloadPaths = [
    'css/style.css',
    'js/app.js', 'js/i18n.js', 'js/footer-cookie.js',
    'js/duas.js', 'js/hijri-date.js', 'js/prayer-times.js', 'js/moon.js', 'js/qibla.js',
    'index.html', 'prayer-times-cities.html', 'legal.html',
    'sw.js',
];
for (const rel of _preloadPaths) {
    try {
        const full = path.join(ROOT, rel);
        const data = fs.readFileSync(full);
        let gzipped = null, brotli = null;
        try { gzipped = zlib.gzipSync(data); } catch(e) {}
        try { brotli = zlib.brotliCompressSync(data, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } // أقصى ضغط — مرة واحدة عند الإقلاع فقط
        }); } catch(e) {}
        _staticCache.set(full, { data, gzipped, brotli });
    } catch(e) { /* الملف قد لا يكون موجوداً، تجاهل */ }
}
console.log(`[Cache] Preloaded ${_staticCache.size} static files into memory (gzip + brotli)`);

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
<p>اس پالیسی سے متعلق کسی بھی سوال کے لیے، براہ کرم ہمارے <a href="/ur/contact">رابطہ صفحے</a> پر جائیں۔</p>`
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
<p>یہ شرائط انٹرنیٹ کے استعمال کے عمومی بین الاقوامی اصولوں کے تحت ہیں۔ تنازعہ کی صورت میں، ہم جہاں تک ممکن ہو دوستانہ حل تلاش کرتے ہیں۔</p>`
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
<p>ہم جلد ہی سوشل میڈیا پلیٹ فارمز پر آفیشل اکاؤنٹس لانچ کریں گے۔ تازہ ترین اپ ڈیٹس کے لیے سائٹ کو فالو کریں۔</p>`
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
<p>سائٹ مکمل طور پر مفت ہے۔ سرور اور ڈیولپمنٹ کے اخراجات کو پورا کرنے کے لیے ہم Google AdSense کی آمدنی پر انحصار کرتے ہیں (منصوبہ بند)۔ ہم دخل اندازی والے اشتہارات یا ہماری اسلامی اقدار سے متضاد کچھ بھی نہیں دکھائیں گے۔</p>`
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
    const fallback = _slugToTitle(slug);
    return { cc: slug, nameAr: fallback, nameEn: fallback };
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

    // دعم 5 لغات: ar (افتراضي بدون prefix)، en، fr، tr، ur
    const SUPPORTED = ['en', 'fr', 'tr', 'ur'];
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
    const canonical = origin + p;
    const SITE_NAMES = {
        ar: 'مواقيت الصلاة', en: 'Prayer Times', fr: 'Heures de Prière',
        tr: 'Namaz Vakitleri', ur: 'اوقاتِ نماز'
    };
    const siteName = SITE_NAMES[lang] || SITE_NAMES.ar;

    // Defaults (homepage)
    let title = isEn
        ? 'Prayer Times & Hijri Calendar — Qibla, Duas, Zakat'
        : 'مواقيت الصلاة والتاريخ الهجري | القبلة، الأدعية، الزكاة';
    let description = isEn
        ? 'Accurate Islamic prayer times, Hijri calendar, Qibla direction, date converter, Zakat calculator, duas & athkar for every city worldwide.'
        : 'مواقيت الصلاة الدقيقة، التاريخ الهجري، اتجاه القبلة، تحويل التاريخ، حاسبة الزكاة، الأدعية والأذكار لكل مدن العالم.';
    let ogType = 'website';
    let geo = null;
    let prev = null, next = null, article = null;
    let webApp = null;           // WebApplication schema metadata (tool pages)
    let qiblaRef = null;         // Kaaba reference for /qibla-in-*
    let cityModified = null;     // dateModified for city pages
    // Localize homepage title/description for additional languages (fallback: AR)
    if (lang === 'fr') {
        title = 'Heures de Prière & Calendrier Hégirien — Qibla, Douas, Zakat';
        description = 'Heures de prière islamiques précises, calendrier hégirien, direction de la Qibla, convertisseur de date, calculateur de Zakat, douas et adhkar pour chaque ville.';
    } else if (lang === 'tr') {
        title = 'Namaz Vakitleri ve Hicri Takvim — Kıble, Dualar, Zekat';
        description = 'Hassas İslami namaz vakitleri, hicri takvim, kıble yönü, tarih dönüştürücü, zekat hesaplayıcı, dualar ve zikirler — her şehir için.';
    } else if (lang === 'ur') {
        title = 'اوقاتِ نماز اور ہجری کیلنڈر — قبلہ، دعائیں، زکوٰۃ';
        description = 'دنیا بھر کے شہروں کے لیے درست اسلامی اوقاتِ نماز، ہجری کیلنڈر، سمتِ قبلہ، تاریخ کنورٹر، زکوٰۃ کیلکولیٹر، دعائیں و اذکار۔';
    }

    const HOME_LABELS = { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', tr: 'Ana Sayfa', ur: 'ہوم' };
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
            title: [ 'Digital Tasbih Counter — Masbaha for Dhikr', 'المسبحة الإلكترونية — عدّاد الذكر اليومي' ],
            desc:  [ 'Free digital tasbih counter that saves your dhikr count between sessions. Track Subhanallah, Alhamdulillah, Allahu Akbar and custom dhikr targets.',
                     'مسبحة إلكترونية مجانية تحفظ عدد الأذكار بين الجلسات. تابع تسبيحك اليومي: سبحان الله، الحمد لله، الله أكبر، أو حدّد ذكراً مخصّصاً وهدفاً.' ],
            app: { category: 'UtilitiesApplication' },
        },
        '/dateconverter': {
            title: [ 'Hijri to Gregorian Date Converter (Two-Way)', 'محوّل التاريخ الهجري إلى الميلادي وبالعكس' ],
            desc:  [ 'Convert Hijri to Gregorian and vice versa for any year from 1 AH to 1500 AH. Based on Umm al-Qura calendar with weekday and historical event lookup.',
                     'حوِّل التاريخ بين الهجري والميلادي لأي سنة من 1 هـ حتى 1500 هـ. يعتمد على تقويم أم القرى ويُظهر اليوم من الأسبوع والأحداث التاريخية.' ],
            app: { category: 'UtilitiesApplication' },
        },
        '/today-hijri-date': {
            title: [ "Today's Hijri Date", 'التاريخ الهجري اليوم' ],
            desc:  [ "Find today's accurate Hijri (Islamic) date and its Gregorian equivalent — updated daily from Umm al-Qura calendar.",
                     'التاريخ الهجري اليوم مع مقابله الميلادي — محدَّث يومياً وفقاً لتقويم أم القرى.' ],
            ogType: 'article',
        },
        '/privacy': {
            title: {
                ar: 'سياسة الخصوصية — مواقيت الصلاة',
                en: 'Privacy Policy — Prayer Times',
                fr: 'Politique de confidentialité — Heures de Prière',
                tr: 'Gizlilik Politikası — Namaz Vakitleri',
                ur: 'پرائیویسی پالیسی — اوقاتِ نماز',
            },
            desc: {
                ar: 'سياسة خصوصية الموقع: ما البيانات التي نجمعها (الموقع، اللغة)، استخدام ملفات تعريف الارتباط، الخدمات الخارجية، وحقوقك في بياناتك.',
                en: 'Our privacy policy explains what data we collect (location, language preference), how cookies are used, third-party services, and your data rights.',
                fr: 'Notre politique de confidentialité explique quelles données nous collectons (localisation, langue), l\u2019utilisation des cookies, les services tiers et vos droits.',
                tr: 'Gizlilik politikamız: hangi verileri topladığımız (konum, dil), çerezlerin nasıl kullanıldığı, üçüncü taraf hizmetler ve veri haklarınız.',
                ur: 'ہماری پرائیویسی پالیسی: ہم کون سا ڈیٹا جمع کرتے ہیں (مقام، زبان)، کوکیز کا استعمال، تیسرے فریق کی خدمات، اور آپ کے ڈیٹا کے حقوق۔',
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
            },
            desc: {
                ar: 'شروط استخدام موقع مواقيت الصلاة: وصف الخدمة، إخلاء المسؤولية عن الدقة، التزامات المستخدم، الملكية الفكرية وحدود المسؤولية.',
                en: 'Terms of use governing access to Prayer Times website: service description, accuracy disclaimer, user obligations, intellectual property and limitation of liability.',
                fr: 'Conditions régissant l\u2019accès au site Heures de Prière : description du service, avertissement sur l\u2019exactitude, obligations de l\u2019utilisateur, propriété intellectuelle et limitation de responsabilité.',
                tr: 'Namaz Vakitleri web sitesine erişimi düzenleyen kullanım şartları: hizmet tanımı, doğruluk sorumluluk reddi, kullanıcı yükümlülükleri, fikri mülkiyet ve sorumluluk sınırlaması.',
                ur: 'اوقاتِ نماز ویب سائٹ تک رسائی کو منظم کرنے والی شرائط استعمال: سروس کی تفصیل، درستگی سے دستبرداری، صارف کی ذمہ داریاں، املاک دانش اور ذمہ داری کی حد۔',
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
            },
            desc: {
                ar: 'تواصل مع فريق مواقيت الصلاة للدعم، الاقتراحات، الشراكات أو للإبلاغ عن مواقيت غير دقيقة في مدينتك.',
                en: 'Get in touch with the Prayer Times team for support, feedback, partnership inquiries or to report inaccurate prayer times in your city.',
                fr: 'Contactez l\u2019équipe Heures de Prière pour le support, les retours, les partenariats ou signaler des heures de prière inexactes dans votre ville.',
                tr: 'Destek, geri bildirim, ortaklık soruları veya şehrinizdeki yanlış namaz vakitlerini bildirmek için Namaz Vakitleri ekibiyle iletişime geçin.',
                ur: 'سپورٹ، تاثرات، شراکت داری کی پوچھ گچھ یا اپنے شہر میں غلط نماز کے اوقات کی اطلاع کے لیے اوقاتِ نماز ٹیم سے رابطہ کریں۔',
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
            },
            desc: {
                ar: 'تعرّف على موقع مواقيت الصلاة: رسالتنا في توفير مواقيت صلاة دقيقة، تقويم هجري، اتجاه قبلة وأدعية مجاناً للمسلمين حول العالم.',
                en: 'Learn about Prayer Times: our mission to provide accurate Islamic prayer schedules, Hijri calendar, Qibla direction and duas freely to Muslims worldwide.',
                fr: 'Découvrez Heures de Prière : notre mission de fournir gratuitement des horaires de prière précis, un calendrier hégirien, la direction de la Qibla et des invocations aux musulmans du monde entier.',
                tr: 'Namaz Vakitleri hakkında bilgi edinin: dünya çapındaki Müslümanlara doğru namaz vakitleri, Hicri takvim, Kıble yönü ve duaları ücretsiz sunma misyonumuz.',
                ur: 'اوقاتِ نماز کے بارے میں جانیں: دنیا بھر کے مسلمانوں کو درست نماز کے اوقات، ہجری کیلنڈر، قبلہ کی سمت اور دعائیں مفت فراہم کرنے کا ہمارا مشن۔',
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

    // ── Hijri year: /hijri-calendar/{year} ──
    m = corePath.match(/^\/hijri-calendar\/(\d{4})$/);
    if (m) {
        const year = m[1];
        title = useEnTxt ? `Hijri Calendar ${year} AH` : `التقويم الهجري لعام ${year} هـ`;
        description = useEnTxt
            ? `Full Hijri calendar for year ${year} AH with all 12 months, days and their Gregorian dates from the Umm al-Qura calendar.`
            : `التقويم الهجري الكامل لعام ${year} هـ مع جميع الأشهر الإثني عشر والأيام وتواريخها الميلادية من تقويم أم القرى.`;
        ogType = 'article';
        breadcrumbs.push({ name: useEnTxt ? 'Hijri Calendar' : 'التقويم الهجري', item: origin + langPrefix + `/hijri-calendar/${year}` });
        prev = origin + langPrefix + `/hijri-calendar/${parseInt(year) - 1}`;
        next = origin + langPrefix + `/hijri-calendar/${parseInt(year) + 1}`;
        article = { published: `${parseInt(year)}-01-01T00:00:00Z`, modified: new Date().toISOString() };
    }

    // ── Hijri month: /hijri-calendar/{month-slug}-{year} ──
    m = corePath.match(/^\/hijri-calendar\/([a-z-]+)-(\d+)$/);
    if (m) {
        const monthSlug = m[1];
        const year = m[2];
        const info = _HIJRI_MONTHS[monthSlug];
        const monthAr = info ? info.ar : _slugToTitle(monthSlug);
        const monthEn = info ? info.en : _slugToTitle(monthSlug);
        title = useEnTxt ? `${monthEn} ${year} AH — Hijri Calendar` : `التقويم الهجري لشهر ${monthAr} ${year} هـ`;
        description = useEnTxt
            ? `Full Hijri calendar for ${monthEn} ${year} AH with all days and their Gregorian dates from the Umm al-Qura calendar.`
            : `التقويم الهجري الكامل لشهر ${monthAr} ${year} هـ مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى في المملكة العربية السعودية.`;
        ogType = 'article';
        breadcrumbs.push({ name: useEnTxt ? 'Hijri Calendar' : 'التقويم الهجري', item: origin + langPrefix + `/hijri-calendar/${year}` });
        breadcrumbs.push({ name: useEnTxt ? `${monthEn} ${year}` : `${monthAr} ${year}`, item: canonical });
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
        title = useEnTxt
            ? `${day} ${monthEn} ${year} AH — Islamic Date with Gregorian Equivalent`
            : `${day} ${monthAr} ${year} هـ — التاريخ الهجري والميلادي`;
        description = useEnTxt
            ? `The Hijri (Islamic) date ${day} ${monthEn} ${year} AH with its exact Gregorian equivalent, events and historical background.`
            : `التاريخ الهجري ${day} ${monthAr} ${year} هـ مع مقابله الميلادي الدقيق والأحداث والخلفية التاريخية لهذا اليوم.`;
        ogType = 'article';
        breadcrumbs.push({ name: useEnTxt ? 'Hijri Calendar' : 'التقويم الهجري', item: origin + langPrefix + `/hijri-calendar/${year}` });
        breadcrumbs.push({ name: useEnTxt ? `${monthEn} ${year}` : `${monthAr} ${year}`, item: origin + langPrefix + `/hijri-calendar/${monthSlug}-${year}` });
        breadcrumbs.push({ name: useEnTxt ? `${day} ${monthEn}` : `${day} ${monthAr}`, item: canonical });
        article = { published: `${parseInt(year)}-01-01T00:00:00Z`, modified: new Date().toISOString() };
    }

    // ── Country listing: /{country-slug} (excluding reserved paths) ──
    let countryListing = null;
    m = corePath.match(/^\/([a-z][a-z0-9-]+)$/);
    if (m && !['qibla', 'moon', 'zakat-calculator', 'duas', 'msbaha', 'dateconverter', 'today-hijri-date', 'index', 'en', 'fr', 'tr', 'ur', 'sw', 'privacy', 'terms', 'contact', 'about-us'].includes(m[1])) {
        const slug = m[1];
        const c = _countryFromSlug(slug);
        const cname = useEnTxt ? c.nameEn : c.nameAr;
        title = useEnTxt ? `Prayer Times in Cities of ${cname}` : `مواقيت الصلاة في مدن ${cname}`;
        description = useEnTxt
            ? `Browse every city in ${cname} for accurate Fajr, Dhuhr, Asr, Maghrib & Isha prayer times, Qibla direction and today's Hijri date with weekly schedule.`
            : `تصفّح جميع مدن ${cname} لمعرفة مواقيت الصلاة الدقيقة (الفجر، الظهر، العصر، المغرب، العشاء)، اتجاه القبلة والتاريخ الهجري والجدول الأسبوعي.`;
        breadcrumbs.push({ name: cname, item: canonical });
        countryListing = { code: (c && c.cc) ? c.cc : slug, name: cname };
    }

    // OG image URL (dynamic SVG endpoint)
    const ogImageUrl = `${origin}/og-image.svg?t=${encodeURIComponent(title)}&l=${lang}`;

    return {
        title, description, canonical, arUrl, enUrl, frUrl, trUrl, urUrl,
        isEn, isRtl, lang, siteName,
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
    parts.push(`<link rel="alternate" hreflang="x-default" href="${esc(seo.arUrl)}">`);
    // OpenGraph
    parts.push(`<meta property="og:title" content="${esc(seo.title)}">`);
    parts.push(`<meta property="og:description" content="${esc(seo.description)}">`);
    parts.push(`<meta property="og:url" content="${esc(seo.canonical)}">`);
    parts.push(`<meta property="og:type" content="${esc(seo.ogType)}">`);
    parts.push(`<meta property="og:site_name" content="${esc(seo.siteName)}">`);
    const LOCALE_MAP = { ar: 'ar_SA', en: 'en_US', fr: 'fr_FR', tr: 'tr_TR', ur: 'ur_PK' };
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

    // Organization with logo + sameAs
    ssrGraph.push({
        "@type": "Organization",
        "@id": orgId,
        "name": seo.siteName,
        "url": seo.origin + '/',
        "logo": { "@id": logoId }
        // "sameAs": [...social links when available...]
    });

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

    const buf = Buffer.from(html, 'utf8');
    const headers = {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Vary': 'Accept-Encoding'
    };
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
        const _oldZakatMatch = urlPath.match(/^\/((?:en|fr|tr|ur)\/)?zakat\/?$/);
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

    // مولّد URL متعدد اللغات (5 لغات) مع hreflang
    function bilingualUrl(relPath, prio, cf, today) {
        const langs = ['ar', 'en', 'fr', 'tr', 'ur'];
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
                ['/about-us', '0.6', 'monthly'],
                ['/contact', '0.5', 'monthly'],
                ['/privacy', '0.4', 'yearly'],
                ['/terms', '0.4', 'yearly'],
            ];
            for (const [p, pr, cf] of staticPaths) {
                entries.push(...bilingualUrl(p, pr, cf, today));
            }

            // 2) صفحات الدول
            const { countryCodes } = getSitemapData();
            for (const cc of countryCodes) {
                const slug = makeCountrySlugSrv(cc);
                entries.push(...bilingualUrl('/' + slug, '0.8', 'weekly', today));
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
    const _LANG_PREFIX_RE = '(?:en|fr|tr|ur)';
    const _isIndexHtmlRoute =
        /^\/(?:(?:en|fr|tr|ur)\/)?dateconverter$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?today-hijri-date$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?msbaha$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?qibla$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?moon$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?zakat-calculator$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?duas$/.test(urlPath) ||
        /^\/(?:en|fr|tr|ur)\/?$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?hijri-calendar\/\d{4}$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?hijri-calendar\/[a-z-]+-\d+$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?hijri-date\/\d+-[a-z-]+-\d+$/.test(urlPath) ||
        /^\/(?:en|fr|tr|ur)\/prayer-times-in-.+$/.test(urlPath) ||
        /^\/(?:(?:en|fr|tr|ur)\/)?qibla-in-.+(?:\.html)?$/.test(urlPath);

    if (_isIndexHtmlRoute) {
        readCachedFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
    }

    // ===== Legal pages: /privacy, /terms, /contact, /about-us (+ /en/...) =====
    {
        const _legalMatch = urlPath.match(/^\/(?:(en|fr|tr|ur)\/)?(privacy|terms|contact|about-us)$/);
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
    if (/^\/(?:(?:en|fr|tr|ur)\/)?about-.+$/.test(urlPath)) {
        fs.readFile(path.join(ROOT, 'about-city.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
    }

    // ===== صفحة مدن الدولة (متعدد اللغات): /en|fr|tr|ur/{country-slug} =====
    if (/^\/(?:en|fr|tr|ur)\/[a-z][a-z0-9-]+$/.test(urlPath)) {
        readCachedFile(path.join(ROOT, 'prayer-times-cities.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
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
        const lang = (langRaw === 'en') ? 'en' : 'ar';
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

    // صفحة مواقيت المدينة العربية: /prayer-times-in-{slug} (بدون .html)
    if (/^\/prayer-times-in-.+$/.test(urlPath)) {
        readCachedFile(path.join(ROOT, 'index.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
    }

    // صفحة مدن الدولة: /{country-slug} — يجب أن تكون آخر route قبل الملفات الثابتة
    if (/^\/[a-z][a-z0-9-]+$/.test(urlPath)) {
        readCachedFile(path.join(ROOT, 'prayer-times-cities.html'), (err, html) => {
            if (err) { res.writeHead(404); res.end('Not Found'); return; }
            serveHtmlWithSeo(html, urlPath, res, _acceptEnc);
        });
        return;
    }

    const filePath    = path.join(ROOT, urlPath);
    const ext         = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const compressible = ['.js', '.css', '.html', '.json', '.svg', '.xml'].includes(ext);
    const isVersioned  = req.url.includes('?v=');
    const isServiceWorker = urlPath === '/sw.js';
    const cacheControl = isServiceWorker
        ? 'no-cache, no-store, must-revalidate'
        : isVersioned
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

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
