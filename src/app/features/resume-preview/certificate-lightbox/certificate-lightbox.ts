import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-certificate-lightbox',
  imports: [CommonModule],
  templateUrl: './certificate-lightbox.html',
  styleUrl: './certificate-lightbox.css'
})
export class CertificateLightbox {
  imageSrc = input<string>('');
  title = input<string>('');
  close = output<void>();
}
