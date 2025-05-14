class Metronome{
    constructor(config) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.interval = null;  // 定时器
        this.isWorking = false // 是否在运行
        this.activeSubdivision = 0 // 当前细分索引

        this.beatCount = config.beatCount || 4 // 总节拍数
        this.beatIndex = config.beatIndex || 1 // 当前拍数
        this.stressFirstBeat = config.stressFirstBeat || true // 第一拍重音
        this.currentBpm = config.bpm || 100 // bpm参数
        this.subdivisionPattern = config.subdivisionPattern = [1] // 细分
        this.subdivisionSound = config.subdivisionSound || { // 细分音
            frequency: 1600, // 频率
            duration: 0.08, // 时长
            volume: config.volume || 0.6, // 音量
        }
        this.accentSound = config.accentSound || { // 细分音
            frequency: 1900, // 频率
            duration: 0.08, // 时长
            volume: config.volume || 0.6, // 音量
        }
        this.commonSound = config.commonSound || { // 细分音
            frequency: 1600, // 频率
            duration: 0.08, // 时长
            volume: config.volume || 0.6, // 音量
        }
    }
    
    // 生成节拍声音
    createTickSound(frequency, duration, volume){
        // 创建一个OscillatorNode, 它表示一个周期性波形（振荡），基本上来说创造了一个音调
        const oscillator = this.audioContext.createOscillator();
        // 创建一个GainNode,它可以控制音频的总音量
        const gainNode = this.audioContext.createGain();

        // 把音量，音调和终节点进行关联
        oscillator.connect(gainNode);
        // audioCtx.destination返回AudioDestinationNode对象，表示当前audio context中所有节点的最终节点，一般表示音频渲染设备
        gainNode.connect(this.audioContext.destination);

        // 指定音调的类型'sine'，也就是正弦波，其他还有square|triangle|sawtooth 为'square'方波，'triangle'三角波以及'sawtooth'锯齿波
        oscillator.type = 'sine';
        // 设置当前播放声音的频率，也就是最终播放声音的调调
        oscillator.frequency.value = frequency;

        // 设置音量
        gainNode.gain.value = volume; // 通过时间设置：setValueAtTime(volume, audioContext.currentTime)
        // 时间内音量从刚刚的变成0.001，指数变化
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        // 设置开始播放
        oscillator.start(); // audioContext.currentTime
        // 定时停止播放
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 播放节拍
    playSound(sound){
        this.createTickSound(sound.frequency, sound.duration, sound.volume)
    }

    // 细分切换
    increaseActiveSubdivision(){
        if (this.activeSubdivision + 1 >= this.subdivisionPattern.length) {
            this.activeSubdivision = 0;
        } else {
            this.activeSubdivision++;
        }
    }

    // 定时播放实现
    beats(){
        const _this = this
        // 计算播放间隔
        const speed = 60 / this.currentBpm * 1000 / this.subdivisionPattern.length;
        const isLastBeat = this.beatIndex >= this.beatCount; // 相对或者超出都是最后拍

        // 细分处理 - 如果设置了细分，并且不是第一拍
        if (this.subdivisionPattern.length > 1 && this.activeSubdivision > 0) {
            if (this.subdivisionPattern[this.activeSubdivision] == 1) {
                this.playSound(this.subdivisionSound);
            }
            this.increaseActiveSubdivision() // 细分索引处理
            this.beatsInterval = setTimeout(function () {
                _this.beats();
            }, speed);
            return;
        }else{
            this.increaseActiveSubdivision() // 细分索引处理
        }
        if(this.isWorking){
            // 如果是最后一拍
            if (isLastBeat){
                this.beatIndex = 1
            }else{
                this.beatIndex += 1
            }

            this.playSound(this.stressFirstBeat && isLastBeat ? this.accentSound : this.commonSound)
            this.beatsInterval = setTimeout(function () {
                _this.beats();
            }, speed);
        }
    }

    // 开始节拍器
    startMetronome() {
        this.isWorking = true
        this.beats()
    }

    // 停止节拍器
    stopMetronome(){
        this.isWorking = false
        clearInterval(this.beatsInterval);
    }

    set bpm(v){
        this.currentBpm = v
    }

    set beat(v){
        this.beatCount = v
    }

    set subdivision(v){
        this.subdivisionPattern = v
    }
}
