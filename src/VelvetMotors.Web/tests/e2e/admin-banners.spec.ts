import { expect, test, type Page } from '@playwright/test';

const adminEmail = process.env.VELVET_ADMIN_EMAIL ?? 'admin@velvetmotors.com.br';
const adminPassword = process.env.VELVET_ADMIN_PASSWORD ?? 'velvet';

type Banner = {
  Id: number;
  Title: string;
  Headline: string;
  Image: string;
  SortOrder: number;
  Active: boolean;
};

const banners: Banner[] = [
  {
    Id: 1,
    Title: 'Showroom premium',
    Headline: 'Seu proximo destino comeca aqui.',
    Image: '/images/banner/1.png',
    SortOrder: 1,
    Active: true
  },
  {
    Id: 2,
    Title: 'Experiencia Velvet',
    Headline: 'Mais do que veiculos.',
    Image: '/images/banner/2.png',
    SortOrder: 2,
    Active: true
  },
  {
    Id: 3,
    Title: 'Curadoria premium',
    Headline: 'Veiculos selecionados.',
    Image: '/images/banner/3.png',
    SortOrder: 3,
    Active: true
  },
  {
    Id: 4,
    Title: 'Imagem do carrossel inicial',
    Headline: 'Banner adicional para teste.',
    Image: '/images/banner/1.png',
    SortOrder: 4,
    Active: false
  }
];

async function mockVelvetApi(page: Page) {
  let currentBanners = [...banners];

  await page.route('**/api/velvet/Login', async (route) => {
    await route.fulfill({ json: { Success: true, Token: 'e2e-token', Message: 'Login realizado.' } });
  });

  await page.route('**/api/velvet/ValidateToken', async (route) => {
    await route.fulfill({ json: { Success: true, Message: 'Token valido.' } });
  });

  await page.route('**/api/velvet/AdminVehicles', async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route('**/api/velvet/Proposals', async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route('**/api/velvet/SiteContent', async (route) => {
    await route.fulfill({
      json: {
        HeroEyebrow: 'Showroom premium em Sao Paulo',
        HeroTitle: 'Seu proximo destino comeca aqui.',
        HeroDescription: 'Veiculos selecionados entre R$ 80.000 e R$ 200.000.'
      }
    });
  });

  await page.route('**/api/velvet/Home', async (route) => {
    await route.fulfill({ json: { Banners: currentBanners, FeaturedCars: [] } });
  });

  await page.route('**/api/velvet/Banners', async (route) => {
    await route.fulfill({ json: currentBanners });
  });

  await page.route('**/api/velvet/UploadVehicleMedia', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');

    await route.fulfill({
      json: {
        Success: true,
        Message: 'Upload concluido.',
        Url: '/uploads/banners/e2e-banner.png'
      }
    });
  });

  await page.route('**/api/velvet/UpdateBanner', async (route) => {
    const body = await route.request().postDataJSON();
    const id = Number(body.id);
    const index = currentBanners.findIndex((banner) => banner.Id === id);

    if (index >= 0) {
      currentBanners[index] = {
        ...currentBanners[index],
        Title: body.title,
        Headline: body.headline,
        Image: body.image,
        SortOrder: body.sortOrder,
        Active: body.active
      };
    }

    await route.fulfill({ json: { Success: true, Message: 'Banner atualizado.' } });
  });

  await page.route('**/api/velvet/DeleteBanner', async (route) => {
    const body = await route.request().postDataJSON();
    currentBanners = currentBanners.filter((banner) => banner.Id !== Number(body.id));

    await route.fulfill({ json: { Success: true, Message: 'Banner removido.' } });
  });
}

async function login(page: Page) {
  await page.goto('/admin/login');
  await expect(page.getByTestId('admin-login-form')).toBeVisible();

  await page.getByTestId('admin-email').fill(adminEmail);
  await page.getByTestId('admin-password').fill(adminPassword);
  await page.getByTestId('admin-login-submit').click();

  await expect(page).toHaveURL(/\/admin$/);
}

test.describe('Painel administrativo - carrossel inicial', () => {
  test.beforeEach(async ({ page }) => {
    await mockVelvetApi(page);
    await login(page);
    await page.getByTestId('admin-menu-showcase').click();
    await expect(page.getByTestId('showcase-manager')).toBeVisible();
  });

  test('valida arquivo, envia nova imagem e remove banner', async ({ page }) => {
    await expect(page.getByTestId('banner-card')).toHaveCount(4);

    const thirdCard = page.locator('[data-testid="banner-card"][data-banner-id="3"]');
    await expect(thirdCard).toBeVisible();
    await thirdCard.getByTestId('edit-banner-button').click();

    const uploadInput = page.getByTestId('banner-form-upload-input');

    await uploadInput.setInputFiles({
      name: 'banner.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('arquivo invalido')
    });
    await expect(page.getByRole('status')).toContainText('Use apenas imagem PNG ou JPG no banner.');

    await uploadInput.setInputFiles({
      name: 'banner-grande.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc((1024 * 1024) + 1)
    });
    await expect(page.getByRole('status')).toContainText('A imagem do banner precisa ter no maximo 1 MB.');

    await uploadInput.setInputFiles({
      name: 'banner-valido.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lU5I6wAAAABJRU5ErkJggg==',
        'base64'
      )
    });

    await expect(page.getByRole('status')).toContainText('Imagem selecionada.');
    await expect(page.getByTestId('banner-editor-preview')).toHaveAttribute('src', /^blob:/);

    await page.getByTestId('save-banner-button').click();
    await expect(page.getByRole('status')).toContainText('Banner atualizado.');
    await expect(thirdCard.locator('img')).toHaveAttribute('src', /https:\/\/www\.ictapi\.com\.br\/uploads\/banners\/e2e-banner\.png/);

    const fourthCard = page.locator('[data-testid="banner-card"][data-banner-id="4"]');
    await expect(fourthCard).toBeVisible();

    await fourthCard.getByTestId('delete-banner-button').click();
    await expect(page.getByRole('status')).toContainText('Banner removido.');
    await expect(fourthCard).toHaveCount(0);
    await expect(page.getByTestId('banner-card')).toHaveCount(3);
  });
});
