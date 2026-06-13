import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { ResumeIcon, ResumeIconName } from '../../../shared/components/resume-icon/resume-icon';
import { urlError } from '../../../shared/validators/field.validators';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { SocialMedia, SocialPlatform } from '../../../core/types/resume.types';
import { SOCIAL_PLATFORMS } from '../../../core/constants/resume.constants';
import { createEmptySocialMedia } from '../../../core/utils/resume.factories';

@Component({
  selector: 'app-social-media-form',
  imports: [CommonModule, FormField, FormInput, ResumeIcon, OrderButtons],
  templateUrl: './social-media-form.html',
  styleUrl: './social-media-form.css'
})
export class SocialMediaForm {
  socialMedia = input<SocialMedia[]>([]);
  socialMediaChanged = output<SocialMedia[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  platforms = SOCIAL_PLATFORMS;
  touchedUrl = new Set<string>();

  addEntry(): void {
    const entry = createEmptySocialMedia();
    this.socialMediaChanged.emit([...this.socialMedia(), entry]);
    this.editModeChanged.emit(entry.id);
  }

  removeEntry(id: string): void {
    this.socialMediaChanged.emit(this.socialMedia().filter(s => s.id !== id));
    if (this.editingId() === id) this.editModeChanged.emit(null);
    this.touchedUrl.delete(id);
  }

  updateEntry(id: string, field: keyof SocialMedia, value: unknown): void {
    const entry = this.socialMedia().find(s => s.id === id);
    if (!entry) return;

    let updatedValue = value;
    let updatedUrl = entry.url;

    if (field === 'platform') {
      const platform = value as SocialPlatform;
      updatedUrl = this.generateUrl(platform, entry.username);
    } else if (field === 'username') {
      const username = value as string;
      updatedUrl = this.generateUrl(entry.platform, username);
    }

    const updated = this.socialMedia().map(s => 
      (s.id === id ? { ...s, [field]: updatedValue, url: updatedUrl } : s)
    );
    this.socialMediaChanged.emit(updated);
  }

  private generateUrl(platform: SocialPlatform, username: string): string {
    if (!username.trim()) return '';
    
    // If it's already a full URL, just return it
    if (username.startsWith('http://') || username.startsWith('https://')) {
      return username;
    }

    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

    switch (platform) {
      case 'github': return `https://github.com/${cleanUsername}`;
      case 'gitlab': return `https://gitlab.com/${cleanUsername}`;
      case 'linkedin': return `https://linkedin.com/in/${cleanUsername}`;
      case 'telegram': return `https://t.me/${cleanUsername}`;
      case 'instagram': return `https://instagram.com/${cleanUsername}`;
      case 'twitter': return `https://twitter.com/${cleanUsername}`;
      case 'youtube': return `https://youtube.com/@${cleanUsername}`;
      default: return username;
    }
  }

  getPlatformLabel(platform: string): string {
    return this.platforms.find(p => p.value === platform)?.label || platform;
  }

  getPlatformIcon(platform: SocialPlatform): ResumeIconName {
    const map: Record<SocialPlatform, ResumeIconName> = {
      github: 'github',
      gitlab: 'gitlab',
      linkedin: 'linkedin',
      telegram: 'telegram',
      instagram: 'instagram',
      twitter: 'twitter',
      youtube: 'youtube',
      website: 'website',
      other: 'social'
    };
    return map[platform] || 'social';
  }

  urlFieldError(id: string, url: string): string {
    return this.touchedUrl.has(id) ? urlError(url) : '';
  }

  touchUrl(id: string): void {
    this.touchedUrl.add(id);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.socialMedia(), id, direction);
    if (next) this.socialMediaChanged.emit(next);
  }

  startEditing(id: string): void { this.editModeChanged.emit(id); }
  stopEditing(): void { this.editModeChanged.emit(null); }
  isEditing(id: string): boolean { return this.editingId() === id; }
}
