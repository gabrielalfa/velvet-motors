const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.port === '4200' ||
    ['localhost', '127.0.0.1'].includes(window.location.hostname));

const velvetBaseUrl = isLocalDev ? '/api/velvet' : 'https://www.ictapi.com.br/Velvet';
const velvetAssetBaseUrl = 'https://www.ictapi.com.br';

export const apiConfig = {
  velvetBaseUrl,
  velvetAssetBaseUrl,
  velvetHomeUrl: `${velvetBaseUrl}/Home`,
  velvetSiteContentUrl: `${velvetBaseUrl}/SiteContent`,
  velvetSaveSiteContentUrl: `${velvetBaseUrl}/SaveSiteContent`,
  velvetBannersUrl: `${velvetBaseUrl}/Banners`,
  velvetBrandsUrl: `${velvetBaseUrl}/Brands`,
  velvetInsertBrandUrl: `${velvetBaseUrl}/InsertBrand`,
  velvetVehiclesUrl: `${velvetBaseUrl}/Vehicles`,
  velvetAdminVehiclesUrl: `${velvetBaseUrl}/AdminVehicles`,
  velvetVehicleUrl: `${velvetBaseUrl}/Vehicle`,
  velvetLoginUrl: `${velvetBaseUrl}/Login`,
  velvetValidateTokenUrl: `${velvetBaseUrl}/ValidateToken`,
  velvetLogoutUrl: `${velvetBaseUrl}/Logout`,
  velvetInsertVehicleUrl: `${velvetBaseUrl}/InsertVehicle`,
  velvetUpdateVehicleUrl: `${velvetBaseUrl}/UpdateVehicle`,
  velvetDeleteVehicleUrl: `${velvetBaseUrl}/DeleteVehicle`,
  velvetUploadVehicleMediaUrl: `${velvetBaseUrl}/UploadVehicleMedia`,
  velvetInsertBannerUrl: `${velvetBaseUrl}/InsertBanner`,
  velvetUpdateBannerUrl: `${velvetBaseUrl}/UpdateBanner`,
  velvetDeleteBannerUrl: `${velvetBaseUrl}/DeleteBanner`,
  velvetProposalsUrl: `${velvetBaseUrl}/Proposals`,
  velvetInsertProposalUrl: `${velvetBaseUrl}/InsertProposal`,
  velvetUpdateProposalStatusUrl: `${velvetBaseUrl}/UpdateProposalStatus`,
  velvetDeleteProposalUrl: `${velvetBaseUrl}/DeleteProposal`,
  velvetChangePasswordUrl: `${velvetBaseUrl}/ChangePassword`
};
