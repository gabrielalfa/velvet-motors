import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteContentService } from '../../services/site-content.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private readonly siteContentService = inject(SiteContentService);
  readonly content = this.siteContentService.content;
  readonly socialLinks = computed(() => {
    const content = this.content();

    return [
      { label: 'Instagram', icon: 'simple-icons:instagram', url: content.instagramUrl },
      { label: 'LinkedIn', icon: 'simple-icons:linkedin', url: content.linkedinUrl },
      { label: 'YouTube', icon: 'simple-icons:youtube', url: content.youtubeUrl }
    ].filter((item) => this.isValidSocialUrl(item.url));
  });

  private isValidSocialUrl(url: string): boolean {
    const value = url.trim();

    return Boolean(value) && value !== '#';
  }
}
