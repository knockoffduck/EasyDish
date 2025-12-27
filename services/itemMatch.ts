import { supabase } from './supabase';
import { AldiProduct } from '../types';

export const findBestAldiMatch = async (ingredientName: string) => {
  console.log('findBestAldiMatch', ingredientName);
  try {
    // 1. Remove the generics from .rpc() to avoid argument type conflicts
    const { data, error } = await supabase
      .rpc('match_aldi_product', {
        search_term: ingredientName.trim(), // Ensure this matches the SQL argument name exactly
      })
      .maybeSingle();

    if (error) {
      console.error('RPC Error:', error.message, error.details, error.hint);
      return null;
    }

    if (!data) {
      console.log(`No match found for: "${ingredientName}"`);
      return null;
    }
    console.log('Match result for', ingredientName, ':', data);

    // 2. Cast data to AldiProduct here
    const product = data as AldiProduct;

    return {
      id: product.id,
      name: product.name,
      category: product.category_name || 'Other',
      price: product.price_amount,
      sku: product.sku,
    };
  } catch (err) {
    console.error('Aldi Match Error:', err);
    return null;
  }
};
