import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { PublisherGithub } from '@electron-forge/publisher-github';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'LinearScreenshot',
    executableName: 'linear-screenshot',
    icon: './assets/icon',
    appBundleId: 'com.tomcerdeira.linear-screenshot',
    appCategoryType: 'public.app-category.productivity',
    extraResource: ['./assets/trayTemplate.png', './assets/trayTemplate@2x.png'],
    osxSign: {},
    ...(process.env.APPLE_ID && process.env.APPLE_ID_PASSWORD && process.env.APPLE_TEAM_ID
      ? {
          osxNotarize: {
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_ID_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
          },
        }
      : {}),
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ['darwin']),
    new MakerDMG({ name: 'LinearScreenshot' }),
    new MakerSquirrel({ name: 'linear-screenshot' }),
    new MakerDeb({
      options: {
        name: 'linear-screenshot',
        productName: 'Linear Screenshot',
        icon: './assets/icon.png',
        categories: ['Utility'],
        bin: 'linear-screenshot',
      },
    }),
    new MakerRpm({
      options: {
        name: 'linear-screenshot',
        productName: 'Linear Screenshot',
        icon: './assets/icon.png',
        categories: ['Utility'],
        bin: 'linear-screenshot',
      },
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'tomcerdeira',
        name: 'linear-screenshots-helper',
      },
      prerelease: false,
      draft: true,
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
