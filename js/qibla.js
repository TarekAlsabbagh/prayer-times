/**
 * حساب اتجاه القبلة
 * يعتمد على إحداثيات الكعبة المشرفة
 */

const Qibla = (function() {
    // إحداثيات الكعبة المشرفة
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;
    const DEG = Math.PI / 180;
    const RAD = 180 / Math.PI;

    function calculate(lat, lng) {
        const phiK = KAABA_LAT * DEG;
        const lambdaK = KAABA_LNG * DEG;
        const phi = lat * DEG;
        const lambda = lng * DEG;

        const numerator = Math.sin(lambdaK - lambda);
        const denominator = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

        let qibla = Math.atan2(numerator, denominator) * RAD;
        if (qibla < 0) qibla += 360;

        return qibla;
    }

    function getDirection(angle) {
        const directions = [
            { min: 0, max: 22.5, name: 'شمال' },
            { min: 22.5, max: 67.5, name: 'شمال شرق' },
            { min: 67.5, max: 112.5, name: 'شرق' },
            { min: 112.5, max: 157.5, name: 'جنوب شرق' },
            { min: 157.5, max: 202.5, name: 'جنوب' },
            { min: 202.5, max: 247.5, name: 'جنوب غرب' },
            { min: 247.5, max: 292.5, name: 'غرب' },
            { min: 292.5, max: 337.5, name: 'شمال غرب' },
            { min: 337.5, max: 360, name: 'شمال' }
        ];
        return directions.find(d => angle >= d.min && angle < d.max)?.name || 'شمال';
    }

    function getDistance(lat, lng) {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = (KAABA_LAT - lat) * DEG;
        const dLng = (KAABA_LNG - lng) * DEG;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat * DEG) * Math.cos(KAABA_LAT * DEG) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    return { calculate, getDirection, getDistance };
})();
