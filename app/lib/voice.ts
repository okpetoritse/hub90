export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data)
      }

      this.mediaRecorder.start()
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error('Microphone access denied')
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(audioBlob)
      }

      this.mediaRecorder.onerror = (event) => {
        this.cleanup()
        reject(new Error(`Recording error: ${event.error}`))
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }
    this.mediaRecorder = null
    this.stream = null
    this.audioChunks = []
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(blob)
      audio.src = url

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(Math.round(audio.duration))
      }

      audio.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get audio duration'))
      }
    })
  }
}

export const playVoiceComment = (voiceUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(voiceUrl)
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('Failed to play audio'))
    audio.play().catch(reject)
  })
}