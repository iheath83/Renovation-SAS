import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Extract dominant colors from image using external API
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string[]>} Array of hex colors
 */
async function extractColorsFromImage(imageUrl) {
  try {
    // Use Imagga Color API (free tier available)
    const apiUrl = `https://api.imagga.com/v2/colors?image_url=${encodeURIComponent(imageUrl)}&extract_overall_colors=1`;
    
    // Note: For production, you'd need an API key. Using alternative free service:
    // Try using the Color API from apicolor.dev
    const colorApiUrl = `https://apicolor.dev/api/v1/dominant?url=${encodeURIComponent(imageUrl)}&count=4`;
    
    try {
      const response = await axios.get(colorApiUrl, {
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.data && Array.isArray(response.data)) {
        const colors = response.data.slice(0, 4).map(color => {
          // Convert to hex if needed
          if (color.hex) return color.hex;
          if (color.rgb) return rgbToHex(color.rgb.r, color.rgb.g, color.rgb.b);
          return color;
        });
        
        if (colors.length >= 3) {
          console.log('✓ Colors extracted from API:', colors);
          return colors;
        }
      }
    } catch (apiError) {
      console.log('Color API failed:', apiError.message);
    }
    
    // Note: Buffer-based extraction disabled as it requires native image processing libraries
    // for accurate results. Using intelligent theme-based palettes instead.
    console.log('ℹ Buffer extraction skipped - using theme-based intelligent palette');
    
  } catch (error) {
    console.log('Color extraction failed:', error.message);
  }
  
  // Final fallback: return null to use theme-based colors
  console.log('✗ Using theme-based color fallback');
  return null;
}

/**
 * Enhanced dominant color extraction from image buffer
 * Uses better sampling and color clustering
 */
function extractDominantColorsFromBuffer(buffer) {
  try {
    // Look for JPEG markers to find actual image data
    let imageDataStart = 0;
    
    // For JPEG, find the Start of Scan (SOS) marker
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xDA) {
        imageDataStart = i + 10; // Skip SOS header
        break;
      }
    }
    
    if (imageDataStart === 0) {
      // Try PNG or fallback to analyzing the whole buffer
      imageDataStart = Math.floor(buffer.length * 0.1); // Skip first 10%
    }
    
    const colorMap = new Map();
    const sampleSize = 5000; // Sample 5000 points
    const imageDataLength = buffer.length - imageDataStart;
    const step = Math.max(3, Math.floor(imageDataLength / sampleSize));
    
    // Sample colors from the actual image data
    for (let i = imageDataStart; i < buffer.length - 2; i += step) {
      const r = buffer[i];
      const g = buffer[i + 1];
      const b = buffer[i + 2];
      
      // Skip invalid RGB values
      if (r === undefined || g === undefined || b === undefined) continue;
      
      // Calculate brightness and saturation
      const brightness = (r + g + b) / 3;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      
      // Skip extremes and very unsaturated colors (likely backgrounds/borders)
      if (brightness < 15 || brightness > 245) continue;
      if (saturation < 0.05 && (brightness < 50 || brightness > 200)) continue;
      
      // Group similar colors with tighter grouping (32 levels = 8 groups per channel)
      const rGroup = Math.floor(r / 32) * 32;
      const gGroup = Math.floor(g / 32) * 32;
      const bGroup = Math.floor(b / 32) * 32;
      
      const colorKey = `${rGroup},${gGroup},${bGroup}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    if (colorMap.size === 0) {
      return null;
    }
    
    // Get top colors and apply k-means-like clustering
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12); // Get top 12 colors
    
    // Cluster similar colors together
    const clusters = [];
    for (const [color, count] of sortedColors) {
      const [r, g, b] = color.split(',').map(Number);
      
      // Find if this color belongs to an existing cluster
      let addedToCluster = false;
      for (const cluster of clusters) {
        const [cr, cg, cb] = cluster.color;
        const distance = Math.sqrt(
          Math.pow(r - cr, 2) + 
          Math.pow(g - cg, 2) + 
          Math.pow(b - cb, 2)
        );
        
        // If color is similar to cluster (distance < 60), merge it
        if (distance < 60) {
          cluster.count += count;
          // Update cluster center with weighted average
          const totalCount = cluster.count;
          cluster.color = [
            Math.round((cr * (totalCount - count) + r * count) / totalCount),
            Math.round((cg * (totalCount - count) + g * count) / totalCount),
            Math.round((cb * (totalCount - count) + b * count) / totalCount),
          ];
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster && clusters.length < 8) {
        clusters.push({ color: [r, g, b], count });
      }
    }
    
    // Sort clusters by frequency and get top 4
    const finalColors = clusters
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(cluster => rgbToHex(...cluster.color));
    
    return finalColors.length >= 3 ? finalColors : null;
  } catch (error) {
    console.log('Buffer color extraction error:', error.message);
    return null;
  }
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Extract Pinterest pin metadata from URL
 * @param {string} url - Pinterest pin URL
 * @returns {Promise<Object>} Extracted metadata
 */
export async function extractPinMetadata(url) {
  try {
    // Validate Pinterest URL
    if (!url.includes('pinterest.')) {
      throw new Error('URL invalide : doit être un lien Pinterest');
    }

    // Try to use Pinterest OEmbed API first (public API)
    try {
      const oembedUrl = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(url)}`;
      const oembedResponse = await axios.get(oembedUrl, { timeout: 5000 });
      
      if (oembedResponse.data) {
        const data = oembedResponse.data;
        const imageUrl = data.thumbnail_url || data.url;
        const titre = cleanText(data.title || 'Inspiration Pinterest');
        const description = cleanText(data.author_name || '') || 'Inspiration trouvée sur Pinterest';
        const tags = extractTagsFromText(data.title + ' ' + data.author_name);
        
        // Extract colors from the actual image
        let couleurs;
        if (imageUrl) {
          const extractedColors = await extractColorsFromImage(imageUrl);
          couleurs = extractedColors || generateColorPalette(titre, description, tags);
        } else {
          couleurs = generateColorPalette(titre, description, tags);
        }
        
        return {
          titre,
          description,
          imageUrl,
          tags,
          couleurs,
          aiExtracted: true,
        };
      }
    } catch (oembedError) {
      console.log('OEmbed failed, trying HTML scraping...', oembedError.message);
    }

    // Fallback to HTML scraping
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract metadata from various sources
    let titre = '';
    let description = '';
    let imageUrl = '';
    let tags = [];
    let couleurs = [];

    // Try Open Graph meta tags first
    titre = $('meta[property="og:title"]').attr('content') || 
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text();

    description = $('meta[property="og:description"]').attr('content') || 
                  $('meta[name="twitter:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') || '';

    imageUrl = $('meta[property="og:image"]').attr('content') || 
               $('meta[name="twitter:image"]').attr('content') || '';

    // Try to extract from Pinterest's data script
    const scriptTags = $('script[type="application/ld+json"]');
    scriptTags.each((i, elem) => {
      try {
        const data = JSON.parse($(elem).html());
        if (data.name && !titre) titre = data.name;
        if (data.description && !description) description = data.description;
        if (data.image && !imageUrl) imageUrl = data.image;
      } catch (e) {
        // Ignore parsing errors
      }
    });
    
    // Try to extract from React app state
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent && scriptContent.includes('__PWS_DATA__')) {
        try {
          // Extract JSON data from Pinterest's React state
          const match = scriptContent.match(/__PWS_DATA__\s*=\s*({.+?});/);
          if (match) {
            const data = JSON.parse(match[1]);
            // Navigate through the data structure to find pin details
            if (data.props && data.props.initialReduxState) {
              const pins = data.props.initialReduxState.pins;
              if (pins) {
                const pinData = Object.values(pins)[0];
                if (pinData) {
                  if (pinData.title && !titre) titre = pinData.title;
                  if (pinData.description && !description) description = pinData.description;
                  if (pinData.images && pinData.images.orig && !imageUrl) {
                    imageUrl = pinData.images.orig.url;
                  }
                }
              }
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    // Extract tags
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 10);
    } else {
      tags = extractTagsFromText(`${titre} ${description}`);
    }

    // Extract dominant colors from the actual image
    if (imageUrl) {
      const extractedColors = await extractColorsFromImage(imageUrl);
      if (extractedColors) {
        couleurs = extractedColors;
      } else {
        // Fallback to theme-based palette
        couleurs = generateColorPalette(titre, description, tags);
      }
    } else {
      couleurs = generateColorPalette(titre, description, tags);
    }

    // Clean and validate data
    titre = cleanText(titre) || 'Inspiration Pinterest';
    description = cleanText(description) || 'Inspiration trouvée sur Pinterest';
    
    // Ensure we have an image URL - use fallback if needed
    if (!imageUrl || imageUrl === '') {
      // Try to find any image in the page
      const firstImage = $('img[src*="pinimg.com"]').first().attr('src');
      if (firstImage) {
        imageUrl = firstImage;
      } else {
        // Last resort: use a placeholder
        imageUrl = `https://picsum.photos/seed/${Date.now()}/400/600`;
      }
    }

    return {
      titre,
      description,
      imageUrl,
      tags: [...new Set(tags)], // Remove duplicates
      couleurs,
      aiExtracted: true,
    };

  } catch (error) {
    console.error('Pinterest extraction error:', error.message);
    
    // If extraction fails, return a basic fallback
    if (error.response?.status === 404) {
      throw new Error('Pin Pinterest introuvable');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Délai d\'extraction dépassé');
    } else if (error.message.includes('image')) {
      throw new Error(error.message);
    } else {
      throw new Error('Impossible d\'extraire les données du pin Pinterest. Vérifiez que le lien est correct.');
    }
  }
}

/**
 * Extract tags from text
 */
function extractTagsFromText(text) {
  const textLower = text.toLowerCase();
  const commonWords = [
    'cuisine', 'salon', 'chambre', 'sdb', 'salle de bain', 'bathroom',
    'terrasse', 'jardin', 'bureau', 'entrée', 'couloir',
    'moderne', 'contemporain', 'rustique', 'industriel', 'scandinave',
    'bohème', 'minimaliste', 'vintage', 'classique', 'épuré',
    'décoration', 'rénovation', 'design', 'intérieur', 'aménagement',
    'bois', 'pierre', 'métal', 'verre', 'béton',
    'lumineux', 'cosy', 'zen', 'élégant', 'chaleureux'
  ];
  
  const foundTags = commonWords.filter(word => textLower.includes(word)).slice(0, 8);
  
  // If we still don't have tags, add generic ones
  if (foundTags.length === 0) {
    return ['inspiration', 'décoration', 'rénovation'];
  }
  
  return foundTags;
}

/**
 * Generate color palette based on content theme and color keywords
 */
function generateColorPalette(titre, description, tags) {
  const text = `${titre} ${description} ${tags.join(' ')}`.toLowerCase();
  
  // Check for specific color mentions first
  const colorKeywords = {
    beige: ['#D4C5B0', '#E8DCC4', '#C9B8A0', '#F5EBD7'],
    crème: ['#FFF8DC', '#F5E6D3', '#EAD9C3', '#D4C4A8'],
    cream: ['#FFF8DC', '#F5E6D3', '#EAD9C3', '#D4C4A8'],
    bois: ['#C19A6B', '#8B6F47', '#D4A574', '#A67B5B'],
    wood: ['#C19A6B', '#8B6F47', '#D4A574', '#A67B5B'],
    blanc: ['#FFFFFF', '#F8F8F8', '#E8E8E8', '#D0D0D0'],
    white: ['#FFFFFF', '#F8F8F8', '#E8E8E8', '#D0D0D0'],
    noir: ['#2C2C2C', '#1A1A1A', '#404040', '#0D0D0D'],
    black: ['#2C2C2C', '#1A1A1A', '#404040', '#0D0D0D'],
    gris: ['#95A5A6', '#7F8C8D', '#BDC3C7', '#34495E'],
    gray: ['#95A5A6', '#7F8C8D', '#BDC3C7', '#34495E'],
    bleu: ['#3498DB', '#2980B9', '#5DADE2', '#1F618D'],
    blue: ['#3498DB', '#2980B9', '#5DADE2', '#1F618D'],
    vert: ['#27AE60', '#229954', '#2ECC71', '#1E8449'],
    green: ['#27AE60', '#229954', '#2ECC71', '#1E8449'],
    rose: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#DB7093'],
    pink: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#DB7093'],
    terracotta: ['#E2725B', '#C65D47', '#B85C50', '#A04B3C'],
    naturel: ['#C9B8A0', '#A89A8A', '#8B7D6B', '#D4C5B0'],
    natural: ['#C9B8A0', '#A89A8A', '#8B7D6B', '#D4C5B0'],
  };
  
  // Check for color keywords
  for (const [keyword, palette] of Object.entries(colorKeywords)) {
    if (text.includes(keyword)) {
      return palette;
    }
  }
  
  // Then check for room/style themes
  const themePalettes = {
    cuisine: ['#F5E6D3', '#C19A6B', '#8B6F47', '#E74C3C'],
    kitchen: ['#F5E6D3', '#C19A6B', '#8B6F47', '#E74C3C'],
    salon: ['#8E44AD', '#34495E', '#1ABC9C', '#BDC3C7'],
    living: ['#8E44AD', '#34495E', '#1ABC9C', '#BDC3C7'],
    chambre: ['#D4A5A5', '#FFE4E1', '#C9B8A0', '#95A5A6'],
    bedroom: ['#D4A5A5', '#FFE4E1', '#C9B8A0', '#95A5A6'],
    'salle de bain': ['#16A085', '#A7D8DE', '#ECF0F1', '#3498DB'],
    bathroom: ['#16A085', '#A7D8DE', '#ECF0F1', '#3498DB'],
    sdb: ['#16A085', '#A7D8DE', '#ECF0F1', '#3498DB'],
    terrasse: ['#27AE60', '#F39C12', '#E67E22', '#8B4513'],
    jardin: ['#27AE60', '#2ECC71', '#F39C12', '#8B4513'],
    bureau: ['#34495E', '#ECF0F1', '#3498DB', '#95A5A6'],
    office: ['#34495E', '#ECF0F1', '#3498DB', '#95A5A6'],
    moderne: ['#2C3E50', '#ECF0F1', '#95A5A6', '#3498DB'],
    modern: ['#2C3E50', '#ECF0F1', '#95A5A6', '#3498DB'],
    contemporain: ['#34495E', '#BDC3C7', '#1ABC9C', '#E74C3C'],
    rustique: ['#8B4513', '#D2691E', '#DEB887', '#A0826D'],
    rustic: ['#8B4513', '#D2691E', '#DEB887', '#A0826D'],
    industriel: ['#34495E', '#7F8C8D', '#C0392B', '#2C3E50'],
    industrial: ['#34495E', '#7F8C8D', '#C0392B', '#2C3E50'],
    scandinave: ['#FFFFFF', '#2C3E50', '#BDC3C7', '#ECF0F1'],
    scandinavian: ['#FFFFFF', '#2C3E50', '#BDC3C7', '#ECF0F1'],
    bohème: ['#E67E22', '#8E44AD', '#27AE60', '#F39C12'],
    boho: ['#E67E22', '#8E44AD', '#27AE60', '#F39C12'],
    minimaliste: ['#FFFFFF', '#2C3E50', '#ECF0F1', '#95A5A6'],
    minimalist: ['#FFFFFF', '#2C3E50', '#ECF0F1', '#95A5A6'],
  };

  // Find matching palette
  for (const [key, palette] of Object.entries(themePalettes)) {
    if (text.includes(key)) {
      return palette;
    }
  }

  // Default warm neutral palette (works for most interior designs)
  return ['#F5E6D3', '#C9B8A0', '#8B7D6B', '#D4A574'];
}

/**
 * Clean extracted text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]/g, ' ')
    .trim()
    .substring(0, 500); // Limit length
}
