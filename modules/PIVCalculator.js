export default class PIVCalculator {
    constructor(root) {
        this.root = root;
    }

    render() {
        this.root.innerHTML = `
            <section class="center-zone">
                <article class="panel page-title">
                    <p class="eyebrow">PIV Utilities</p>
                    <h1>Maximum Allowable Velocity</h1>
                    <p>Estimate the highest particle velocity that stays within a selected blur limit during a laser pulse.</p>
                </article>

                <article class="panel">
                    <div class="panel-body">
                        <form id="piv-form" class="calculator-grid" autocomplete="off">
                            <div class="input-card">
                                <label for="fov-mm">FOV field of view</label>
                                <input id="fov-mm" name="fovMm" type="number" step="any" min="0" value="100" inputmode="decimal">
                                <small>Camera field of view in millimeters.</small>
                            </div>

                            <div class="input-card">
                                <label for="resolution-px">Resolution</label>
                                <input id="resolution-px" name="resolutionPx" type="number" step="any" min="0" value="2048" inputmode="decimal">
                                <small>Camera resolution across the FOV in pixels.</small>
                            </div>

                            <div class="input-card">
                                <label for="max-pixel-blur-px">Max pixel blur</label>
                                <input id="max-pixel-blur-px" name="maxPixelBlurPx" type="number" step="any" min="0" value="1" inputmode="decimal">
                                <small>Maximum allowable image blur in pixels.</small>
                            </div>

                            <div class="input-card">
                                <label for="pulse-length-us">Laser pulse length</label>
                                <input id="pulse-length-us" name="pulseLengthUs" type="number" step="any" min="0" value="10" inputmode="decimal">
                                <small>Pulse duration in microseconds.</small>
                            </div>
                        </form>

                        <section class="result-panel" aria-live="polite">
                            <div>
                                <p class="eyebrow">Result</p>
                                <div id="velocity-result" class="result-value">-- m/s</div>
                            </div>
                            <div class="result-subgrid">
                                <div class="result-tile">
                                    <span>mm per px</span>
                                    <strong id="mm-per-px">--</strong>
                                </div>
                                <div class="result-tile">
                                    <span>Blur distance</span>
                                    <strong id="blur-mm">--</strong>
                                </div>
                                <div class="result-tile">
                                    <span>Pulse time</span>
                                    <strong id="pulse-s">--</strong>
                                </div>
                            </div>
                            <p id="calc-note" class="formula"></p>
                        </section>
                    </div>
                </article>
            </section>`;

        this.bind();
        this.calculate();
    }

    bind() {
        this.form = this.root.querySelector('#piv-form');
        this.fields = {
            fovMm: this.root.querySelector('#fov-mm'),
            resolutionPx: this.root.querySelector('#resolution-px'),
            maxPixelBlurPx: this.root.querySelector('#max-pixel-blur-px'),
            pulseLengthUs: this.root.querySelector('#pulse-length-us')
        };
        this.output = {
            velocity: this.root.querySelector('#velocity-result'),
            mmPerPx: this.root.querySelector('#mm-per-px'),
            blurMm: this.root.querySelector('#blur-mm'),
            pulseS: this.root.querySelector('#pulse-s'),
            note: this.root.querySelector('#calc-note')
        };

        this.form.addEventListener('input', () => this.calculate());
    }

    calculate() {
        const fovMm = this.readFloat(this.fields.fovMm.value);
        const resolutionPx = this.readFloat(this.fields.resolutionPx.value);
        const maxPixelBlurPx = this.readFloat(this.fields.maxPixelBlurPx.value);
        const pulseLengthUs = this.readFloat(this.fields.pulseLengthUs.value);

        if (fovMm <= 0 || resolutionPx <= 0 || maxPixelBlurPx < 0 || pulseLengthUs <= 0) {
            this.output.velocity.textContent = '-- m/s';
            this.output.mmPerPx.textContent = '--';
            this.output.blurMm.textContent = '--';
            this.output.pulseS.textContent = '--';
            this.output.note.innerHTML = '<span class="warning">Enter positive FOV, resolution, and pulse length values. Max pixel blur may be zero or positive.</span>';
            return;
        }

        const mmPerPx = fovMm / resolutionPx;
        const blurMm = mmPerPx * maxPixelBlurPx;
        const pulseSeconds = pulseLengthUs * 1e-6;
        const velocityMs = (blurMm / 1000) / pulseSeconds;

        this.output.velocity.textContent = `${this.formatNumber(velocityMs)} m/s`;
        this.output.mmPerPx.textContent = `${this.formatNumber(mmPerPx, 6)} mm/px`;
        this.output.blurMm.textContent = `${this.formatNumber(blurMm, 6)} mm`;
        this.output.pulseS.textContent = `${this.formatNumber(pulseSeconds, 8)} s`;
        this.output.note.textContent = 'Formula: velocity = ((FOV mm / resolution px) * max blur px / 1000) / (pulse length us * 1e-6).';
    }

    readFloat(value) {
        const number = Number.parseFloat(value);
        return Number.isFinite(number) ? number : Number.NaN;
    }

    formatNumber(value, digits = 4) {
        if (!Number.isFinite(value)) {
            return '--';
        }

        if (value === 0) {
            return '0';
        }

        if (Math.abs(value) >= 10000 || Math.abs(value) < 0.0001) {
            return value.toExponential(3);
        }

        return Number(value.toPrecision(digits)).toString();
    }
}
