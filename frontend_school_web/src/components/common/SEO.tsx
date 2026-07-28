import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  ogType = 'website', 
  ogImage = '/og-image.jpg', 
  schema 
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | KCP Public School, Lucknow`;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Open Graph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    // 4. Update Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    // 5. Update Open Graph Image
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.setAttribute('content', ogImage);

    // 6. Update Open Graph Type
    let ogT = document.querySelector('meta[property="og:type"]');
    if (!ogT) {
      ogT = document.createElement('meta');
      ogT.setAttribute('property', 'og:type');
      document.head.appendChild(ogT);
    }
    ogT.setAttribute('content', ogType);

    // 7. Inject JSON-LD Schema
    const existingScript = document.getElementById('jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }
    
    if (schema) {
      const script = document.createElement('script');
      script.id = 'jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up script on unmount
      const script = document.getElementById('jsonld-schema');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, ogType, ogImage, schema]);

  return null;
};

export default SEO;
