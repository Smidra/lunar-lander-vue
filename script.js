const ZAZEH_INIT = 0
const PALIVO_INIT = 7200
const VYSKA_INIT = 192000
const RYCHLOST_INIT = 1620
// const VYSKA_INIT = 20000
// const RYCHLOST_INIT = 500
const CAS_INIT = 0
const CASOVY_INTERVAL_SEKUND_INIT = 10
const VAHA_MODULU_INIT = 1800
const GRAVITACE_MESICE_INIT = 1.62
const VYSLEDEK_PRISTANI_INIT = ""
const HISTORIE_INIT = []

const app = Vue.createApp({
        setup() {
            return {
                message: 'naive',
            }
        },
        data() {
            return {
                zazeh: ZAZEH_INIT,
                palivo: PALIVO_INIT,
                vyska: VYSKA_INIT,
                rychlost: RYCHLOST_INIT,
                cas: CAS_INIT,
                casovy_interval_sekund: CASOVY_INTERVAL_SEKUND_INIT,
                vaha_modulu: VAHA_MODULU_INIT,
                gravitace_mesice: GRAVITACE_MESICE_INIT,
                vysledek_pristani: VYSLEDEK_PRISTANI_INIT,
                historie: HISTORIE_INIT
            }
        },
        computed: {
            procentPaliva() {
                return Math.floor(this.palivo / 72)
            },
            procentVysky() {
                return Math.floor(this.vyska / 1920.00)
            },
            zazehString() {
                return this.zazeh.toString()
            },
            kilometry() {
                return Math.floor(this.vyska / 1000)
            },
            metry() {
                return this.vyska - Math.floor(this.vyska / 1000) * 1000
            }
        },
        methods: {
            // Calculate v by Tsiolkovsky rocket equation and gravitation.
            // To calculate h we need to integrate the rocket/gravitation equation.
            // We do this by approximation/iteration.
            // popoletni(fuelUsed) {
            //     // const
            //     var g = 1.62; // gravitation (m/s**2)
            //     var m = 5000; // mass (kg; without fuel)
            //     var ve = 3000; // exit velocity (m/s)
            //     var t = 10; // burning period (s)
            //
            //     // var
            //     // var h = 30000; // height (m)
            //     // var v = 1000; // velocity (m/s)
            //     // var fuel = 3000; // kg
            //
            //     fuelUsed = fuelUsed || 0;
            //     fuelUsed = Math.max(fuelUsed, 0);
            //     fuelUsed = Math.min(fuelUsed, fuel);
            //
            //     var tDelta = t / iterations;
            //     var fuelDelta = fuelUsed / iterations;
            //
            //     for (var i = 0; i < iterations; i++) {
            //         if (h <= 0) {
            //             break;
            //         }
            //         var mTotal = m + fuel;
            //         var vNext = v - ve * Math.log(mTotal / (mTotal - fuelDelta)) + g * tDelta;
            //         var vMean = (v + vNext) / 2;
            //         h = h - vMean * tDelta;
            //         v = vNext;
            //         fuel = fuel - fuelDelta;
            //     }
            // },
            popoletni(spalenePalivo) {
                let celkem_spalene_palivo = spalenePalivo * this.casovy_interval_sekund
                // Pokud palime a uz nemame, spalime co mame.
                if (celkem_spalene_palivo > this.palivo) {
                    spalenePalivo = this.palivo
                }


                // Bez paliva se zadne palivo nespali
                let mass_start
                let mass_end
                if (this.palivo <= 0) {
                    // Nic se nespalilo
                    console.log('Nic se nespalilo')
                    spalenePalivo = 0
                    mass_start = this.vaha_modulu;
                    mass_end = this.vaha_modulu;
                } else {
                    mass_start = this.vaha_modulu + (this.palivo);
                    mass_end = this.vaha_modulu + (this.palivo - celkem_spalene_palivo);
                }

                nove_palivo = this.palivo - celkem_spalene_palivo
                if (nove_palivo < 0) {
                    this.palivo = 0
                } else {
                    this.palivo = nove_palivo
                }

                // Vypocitej zmenu rychlosti
                let delta_v_thrust = this.rychlost * Math.log(mass_start / mass_end);
                let delta_v_gravity = this.gravitace_mesice * this.casovy_interval_sekund;

                // Vypocitej novou rychlost a vysku
                this.rychlost = this.rychlost - delta_v_thrust + delta_v_gravity;
                let nova_vyska = this.vyska - this.rychlost * this.casovy_interval_sekund;

                // Pokud jsme pod povrchem, hra konci
                if (nova_vyska <= 0) {
                    console.log('Konec hry')
                    this.vyska = 0
                    this.konec_hry()
                } else {
                    this.vyska = nova_vyska
                }

                this.zazeh = 0 // Reset ovladaciho panelu
                this.cas += this.casovy_interval_sekund // Posun cas do dalsiho intervalu
                this.historie.unshift({
                    cas: this.cas,
                    vyska: this.vyska,
                    rychlost: this.rychlost,
                    palivo: this.palivo,
                })
            },
            konec_hry() {
                if (this.rychlost <= 1) {
                    this.vysledek_pristani = 'Dokonale měkké přistání. Modul se dotkne povrchu s minimálním nárazem a bez poškození. Astronauté pocítí jen mírné otřesení.'
                } else if (this.rychlost <= 3) {
                    this.vysledek_pristani = 'Tvrdé přistání, ale nic se nikomu nestalo. Modul se dotkne povrchu s větším nárazem, ale bez vážného poškození. Astronauté pocítí silnější otřesení, ale neměli by být zraněni.'
                } else if (this.rychlost <= 6) {
                    this.vysledek_pristani = 'Přistání s několika problémy. Modul se dotkne povrchu s velkým nárazem a může být poškozen. Astronauté pocítí silné otřesení a mohou být zraněni.'
                } else {
                    this.vysledek_pristani = 'Katastrofální přistání. Modul se zřítí na povrch a exploduje. Všichni astronauté zahynou a je to tvoje chyba.'
                }
            },
            restart_hry() {
                this.zazeh = ZAZEH_INIT
                this.palivo = PALIVO_INIT
                this.vyska = VYSKA_INIT
                this.rychlost = RYCHLOST_INIT
                this.cas = CAS_INIT
                this.casovy_interval_sekund = CASOVY_INTERVAL_SEKUND_INIT
                this.vaha_modulu = VAHA_MODULU_INIT
                this.gravitace_mesice = GRAVITACE_MESICE_INIT
                this.vysledek_pristani = VYSLEDEK_PRISTANI_INIT
                this.historie = []
            }
        },
    }
)
app.use(naive)
app.mount('#lander')