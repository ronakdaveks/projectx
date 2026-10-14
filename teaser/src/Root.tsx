import React from 'react';
import {Composition} from 'remotion';
import {Teaser, TeaserProps} from './Teaser';

export const FPS = 30;
export const DURATION_SECONDS = 100;

export const Root: React.FC = () => (
  <Composition
    id="Teaser"
    component={Teaser}
    width={1920}
    height={1080}
    fps={FPS}
    durationInFrames={FPS * DURATION_SECONDS}
    defaultProps={{vo: null} as TeaserProps}
  />
);
