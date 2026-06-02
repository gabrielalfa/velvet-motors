import { expect, test } from '@playwright/test';

const adminEmail = process.env.VELVET_ADMIN_EMAIL ?? 'admin@velvetmotors.com.br';
const adminPassword = process.env.VELVET_ADMIN_PASSWORD ?? 'velvet';

const vehicleName = `Teste E2E Velvet ${Date.now()}`;
const editedVehicleName = `${vehicleName} Editado`;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await expect(page.getByTestId('admin-login-form')).toBeVisible();

  await page.getByTestId('admin-email').fill(adminEmail);
  await page.getByTestId('admin-password').fill(adminPassword);
  await page.getByTestId('admin-login-submit').click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByTestId('admin-menu-fleet')).toBeVisible();
}

async function openVehicles(page: import('@playwright/test').Page) {
  await page.getByTestId('admin-menu-fleet').click();
  await expect(page.getByRole('heading', { name: 'Veiculos publicados' })).toBeVisible();
  await expect(page.getByTestId('vehicle-search-input')).toBeVisible();
}

async function createVehicle(page: import('@playwright/test').Page, name: string) {
  await page.getByTestId('add-vehicle-button').click();
  await expect(page.getByTestId('vehicle-editor')).toBeVisible();

  await page.getByTestId('vehicle-name-input').fill(name);
  await page.getByTestId('vehicle-brand-input').fill('Velvet Test');
  await page.getByTestId('vehicle-year-input').fill('2026');
  await page.getByTestId('vehicle-price-input').fill('150000');
  await page.getByTestId('vehicle-km-input').fill('1234');
  await page.getByTestId('vehicle-condition-input').fill('Teste automatizado');
  await page.getByTestId('vehicle-body-input').fill('Sedan');
  await page.getByTestId('vehicle-status-select').selectOption('Publicado');

  await page.getByTestId('save-vehicle-button').click();
  await expect(page.getByTestId('save-vehicle-button')).toBeEnabled({ timeout: 45_000 });
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByTestId('vehicle-editor')).toBeHidden({ timeout: 15_000 });
}

async function searchVehicle(page: import('@playwright/test').Page, name: string) {
  await page.getByTestId('vehicle-search-input').fill(name);
  const row = page.getByTestId('admin-vehicle-row').filter({ hasText: name });
  await expect(row).toBeVisible();
  return row;
}

test.describe.serial('Painel administrativo - veiculos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openVehicles(page);
  });

  test('loga, abre veiculos, adiciona, busca, filtra, edita e exclui veiculo', async ({ page }) => {
    await createVehicle(page, vehicleName);

    let row = await searchVehicle(page, vehicleName);
    await expect(row.getByText('Publicado')).toBeVisible();

    await page.getByTestId('vehicle-status-filter-Publicado').click();
    row = await searchVehicle(page, vehicleName);
    await expect(row).toBeVisible();

    await row.getByTestId('edit-vehicle-button').click();
    await expect(page.getByTestId('vehicle-editor')).toBeVisible();
    await expect(page.getByTestId('vehicle-name-input')).toHaveValue(vehicleName);

    await page.getByTestId('vehicle-name-input').fill(editedVehicleName);
    await page.getByTestId('vehicle-km-input').fill('2345');
    await page.getByTestId('save-vehicle-button').click();
    await expect(page.getByTestId('save-vehicle-button')).toBeEnabled({ timeout: 45_000 });
    await expect(page.getByTestId('vehicle-editor')).toBeHidden({ timeout: 15_000 });

    row = await searchVehicle(page, editedVehicleName);
    await expect(row).toContainText('2.345');

    await row.getByTestId('delete-vehicle-button').click();
    await expect(row).toBeHidden();

    await page.reload();
    await openVehicles(page);
    await page.getByTestId('vehicle-search-input').fill(editedVehicleName);
    await expect(page.getByTestId('admin-vehicle-row').filter({ hasText: editedVehicleName })).toBeHidden();
  });
});
