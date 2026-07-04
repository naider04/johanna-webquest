import React from 'react';

export default function WixBanner() {
  return (
    <>
      <style>{`
        /* Wix Banner Styles */
        .wix-banner-container {
          width: 100%;
          z-index: 9999;
          position: fixed;
          top: 0;
          left: 0;
        }
        
        .wix-banner-bar { 
          box-sizing: border-box; 
          background: #eff1f2; 
          border-bottom: 1px solid #166aea; 
          justify-content: center; 
          align-items: center; 
          width: 100%; 
          height: 50px; 
          display: flex; 
          text-decoration: none; 
          transition: background 0.2s;
        }

        .wix-banner-bar .siPsSS { 
          align-items: center; 
          display: flex; 
        }
        
        .wix-banner-bar .siPsSS .RG5MFM { 
          color: #20303c; 
          font-size: 14px; 
          font-weight: 400; 
          display: flex; 
          align-items: center; 
        }
        
        .wix-banner-bar .siPsSS .ZXZxQl { 
          margin: 0 10px; 
          display: inline-flex; 
        }
        
        .wix-banner-bar .siPsSS .UDO2pA { 
          border-right: 1px solid #000; 
          padding-right: 8px; 
          display: flex; 
          align-items: center; 
        }

        .wix-banner-bar .zAqGm2 { 
          text-align: center; 
          color: #166aea; 
          border: 1px solid #166aea; 
          border-radius: 17px; 
          width: 112px; 
          height: 25px; 
          font-size: 13px; 
          display: inline-flex; 
          justify-content: center; 
          align-items: center; 
          margin-left: 16px; 
          background-color: transparent;
          transition: all 0.2s ease; 
          font-weight: 500;
        }

        .wix-banner-bar:hover .zAqGm2 { 
          background-color: #166aea !important; 
          color: #ffffff !important;           
          cursor: pointer;
        }
      `}</style>

      <div id="WIX_ADS" className="wix-banner-container">
        <a href="https://www.wix.com" target="_blank" rel="nofollow" className="wix-banner-bar">
          <span className="siPsSS">
            <span className="RG5MFM">
              {/* Wix Logo */}
              <div className="ZXZxQl">
                <div className="UDO2pA">
                  <svg width="60" height="20" viewBox="0 0 39 15" fill="none" aria-label="wix">
                    <path d="M38.9999 0H36.8456C36.248 0 35.6894 0.280264 35.3538 0.74896L32.4728 4.77402C32.396 4.88076 32.2297 4.88076 32.1529 4.77402L29.2719 0.74896C28.9369 0.280264 28.3777 0 27.7801 0H25.6258L30.7581 7.16998L25.6541 14.3H27.8084C28.406 14.3 28.9646 14.0197 29.3002 13.551L32.1529 9.56593C32.2297 9.45919 32.396 9.45919 32.4728 9.56593L35.3254 13.551C35.6604 14.0197 36.2196 14.3 36.8172 14.3H38.9715L33.8676 7.16998L38.9999 0Z" fill="black"></path>
                    <path d="M21.193 1.46274V14.3H22.2226C23.0758 14.3 23.7673 13.6453 23.7673 12.8373V0H22.7377C21.8844 0 21.193 0.654743 21.193 1.46274Z" fill="black"></path>
                    <path d="M19.3054 0H18.3892C17.3804 0 16.5063 0.660706 16.2828 1.59214L14.233 10.1259L12.4389 2.15982C12.1071 0.68754 10.512 -0.305308 8.87973 0.121646C7.84005 0.393561 7.06927 1.22541 6.84446 2.22422L5.06864 10.1151L3.02267 1.59273C2.79849 0.661302 1.92443 0 0.915617 0H0L3.43388 14.2994H4.73489C5.91562 14.2994 6.93577 13.5176 7.18199 12.424L9.37721 2.66787C9.40429 2.54682 9.5189 2.45916 9.64925 2.45916C9.7796 2.45916 9.89421 2.54682 9.92129 2.66787L12.1184 12.4246C12.3646 13.5182 13.3848 14.2994 14.5655 14.2994H15.8709L19.3054 0Z" fill="black"></path>
                  </svg>
                </div>
              </div> 
              This website was built on Wix. Create yours today.
            </span>
            <span className="zAqGm2">Get Started</span>
          </span>
        </a>
      </div>
    </>
  );
}
