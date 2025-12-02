# Country Flag Plugin for [FM-DX-Webserver](https://github.com/NoobishSVK/fm-dx-webserver)

This plugin for the FMDX web server displays the country flag below the TX station data.

![image](https://github.com/user-attachments/assets/d6f84f67-be91-4e74-9e1a-93e884d790a5)

## v1.0

- The country flag is displayed animated or statically
- Blur, motion, and transparency can be individually adjusted in the header

## Installation notes:

1. [Download](https://github.com/Highpoint2000/CountryFlag/releases) the last repository as a zip
2. Unpack all files from the plugins folder to ..fm-dx-webserver-main\plugins\
3. Stop or close the fm-dx-webserver
4. Start/Restart the fm-dx-webserver with "npm run webserver" on node.js console, check the console informations
5. Activate the country flag plugin in the settings

## Configuration options

The following variables can be changed in the header of the countryflag.js:

    const blurAmount = '5px';  // Blur strength (e.g. '5px', '0px' for sharp / default: '5px')
    const opacity = '0.30'; // Opacity of the background (0.0 - 1.0 / default: '0.30')
    const animationEnabled = true;   // Enable/Disable waving animation (true/false)
    const waveStrength = 3.0;    // Intensity of the wave (0.5 = subtle, 3.0 = strong / default: 3.0)

## Contact

If you have any questions, would like to report problems, or have suggestions for improvement, please feel free to contact me! You can reach me by email at highpoint2000@googlemail.com. I look forward to hearing from you!

<a href="https://www.buymeacoffee.com/Highpoint" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

<details>
<summary>History</summary>

