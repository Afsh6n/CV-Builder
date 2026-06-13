import { Component, ElementRef, viewChild, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-uploader',
  imports: [CommonModule],
  templateUrl: './photo-uploader.html',
  styleUrl: './photo-uploader.css'
})
export class PhotoUploader {
  private fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  currentPhoto = input<string>('');

  photoChanged = output<string>();

  previewPhoto = computed(() => this.currentPhoto());
  isUploading = signal(false);
  error = signal<string>('');

  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!this.isValidImageFile(file)) {
      this.error.set('لطفاً یک فایل تصویر معتبر انتخاب کنید (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('حجم فایل باید کمتر از ۵ مگابایت باشد');
      return;
    }

    this.error.set('');
    this.isUploading.set(true);

    try {
      const base64 = await this.convertFileToBase64(file);
      this.photoChanged.emit(base64);
    } catch {
      this.error.set('خطا در پردازش تصویر');
    } finally {
      this.isUploading.set(false);
      input.value = '';
    }
  }

  removePhoto(): void {
    this.photoChanged.emit('');
    this.error.set('');
  }

  private isValidImageFile(file: File): boolean {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      reader.readAsDataURL(file);
    });
  }
}