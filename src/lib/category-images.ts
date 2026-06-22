// Image mapping for service categories
import serviceCoiffure from '@/assets/service-coiffure.jpg';
import serviceTresses from '@/assets/service-tresses.jpg';
import serviceOngles from '@/assets/service-ongles.jpg';
import serviceMaquillage from '@/assets/service-makeup.jpg';
import serviceSoins from '@/assets/service-soins.jpg';
import serviceMassage from '@/assets/service-massage.jpg';
import serviceHamam from '@/assets/service-hamam.jpg';
import serviceHomme from '@/assets/service-homme.jpg';
import serviceHair from '@/assets/service-hair.jpg';

const categoryImages: Record<string, string> = {
  'Coiffure': serviceCoiffure,
  'Tresses': serviceTresses,
  'Ongles': serviceOngles,
  'Maquillage': serviceMaquillage,
  'Soins': serviceSoins,
  'Massage': serviceMassage,
  'Hamam': serviceHamam,
  'Homme': serviceHomme,
  'Traitement': serviceHair,
};

export function getCategoryImage(categorie?: string): string {
  if (!categorie) return serviceCoiffure;
  return categoryImages[categorie] || serviceCoiffure;
}

export function getAllCategories(): string[] {
  return Object.keys(categoryImages);
}

export default categoryImages;
