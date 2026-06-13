import { Component, signal, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-photo-uploader',
  imports: [CommonModule, FormsModule],
  templateUrl: './photo-uploader.html',
  styleUrl: './photo-uploader.css'
})
export class PhotoUploader {
  currentPhoto = input<string>('');
  photoOffsetY = input<number>(50);

  photoChanged = output<string>();
  offsetChanged = output<number>();

  previewPhoto = signal<string>('');
  offset = signal<number>(50);
  isUploading = signal<boolean>(false);
  error = signal<string>('');

  constructor() {
    effect(() => {
      this.previewPhoto.set(this.currentPhoto());
      this.offset.set(this.photoOffsetY());
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const file = input.files[0];
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
    this.convertFileToBase64(file)
      .then(base64 => {
        this.previewPhoto.set(base64);
        this.photoChanged.emit(base64);
        this.isUploading.set(false);
      })
      .catch(() => {
        this.error.set('خطا در پردازش تصویر');
        this.isUploading.set(false);
      });
  }

  removePhoto(): void {
    this.previewPhoto.set('');
    this.photoChanged.emit('');
    this.error.set('');
  }

  onOffsetChange(value: number): void {
    this.offset.set(value);
    this.offsetChanged.emit(value);
  }

  getPhotoStyle(): Record<string, string> {
    return { 'object-position': `center ${this.offset()}%` };
  }

  private isValidImageFile(file: File): boolean {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  triggerFileInput(): void {
    document.getElementById('photo-input')?.click();
  }
}
