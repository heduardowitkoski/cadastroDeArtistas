import { API_URL } from './apiConfig'
import { assetUrl as resolveAssetUrl } from './artistProfile'
export const assetUrl = (value?:string|null) => resolveAssetUrl(value,API_URL)
