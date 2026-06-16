import { Component, input, output } from '@angular/core';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { ResumeIcon, ResumeIconName } from '../../../shared/components/resume-icon/resume-icon';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { EditorItemActions } from '../../../shared/components/editor-item-actions/editor-item-actions';
import { EditorFormActions } from '../../../shared/components/editor-form-actions/editor-form-actions';
import { EditorAddButton } from '../../../shared/components/editor-add-button/editor-add-button';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { ListEditController } from '../../../shared/utils/list-edit.controller';
import { SocialMedia, SocialPlatform } from '../../../core/types/resume.types';
import { SOCIAL_PLATFORMS } from '../../../core/constants/resume.constants';
import { createEmptySocialMedia } from '../../../core/utils/resume.factories';

@Component({
  selector: 'app-social-media-form',
  imports: [
    FormField,
    FormInput,
    ResumeIcon,
    OrderButtons,
    EditorItemActions,
    EditorFormActions,
    EditorAddButton
  ],
  templateUrl: './social-media-form.html',
  styleUrl: './social-media-form.css'
})
export class SocialMediaForm {
  socialMedia = input<SocialMedia[]>([]);
  socialMediaChanged = output<SocialMedia[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  private readonly editCtrl = new ListEditController<SocialMedia>(
    () => this.socialMedia(),
    items => this.socialMediaChanged.emit(items),
    () => this.editingId(),
    id => this.editModeChanged.emit(id),
    createEmptySocialMedia
  );

  platforms = SOCIAL_PLATFORMS;

  addEntry = (): void => { this.editCtrl.add(); };
  removeEntry = (id: string): void => { this.editCtrl.remove(id); };
  startEditing = (id: string): void => { this.editCtrl.startEditing(id); };
  saveEditing = (id: string): void => { this.editCtrl.completeSave(id); };
  cancelEditing = (id: string): void => { this.editCtrl.cancel(id); };
  isEditing = (id: string): boolean => this.editCtrl.isEditing(id);

  updateEntry(id: string, field: keyof SocialMedia, value: unknown): void {
    const entry = this.socialMedia().find(s => s.id === id);
    if (!entry) return;

    let updatedUrl = entry.url;
    if (field === 'platform') {
      updatedUrl = this.generateUrl(value as SocialPlatform, entry.username);
    } else if (field === 'username') {
      updatedUrl = this.generateUrl(entry.platform, value as string);
    }

    const updated = this.socialMedia().map(s =>
      s.id === id ? { ...s, [field]: value, url: updatedUrl } : s
    );
    this.socialMediaChanged.emit(updated);
  }

  private generateUrl(platform: SocialPlatform, username: string): string {
    if (!username.trim()) return '';
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

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.socialMedia(), id, direction);
    if (next) this.socialMediaChanged.emit(next);
  }
}
