import React, { useEffect } from 'react';

const AdBanner = ({ adSlot, adFormat = 'auto', style = {} }) => {
  useEffect(() => {
    // Google AdSenseが読み込まれているかチェック
    if (window.adsbygoogle) {
      try {
        // 既存の広告をクリア
        const ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach(ad => {
          if (ad.dataset.adStatus === 'unfilled') {
            ad.remove();
          }
        });

        // 新しい広告を表示
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adSlot]);

  return (
    <div className="ad-banner" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5695568865868034" // あなたのAdSenseパブリッシャーID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;