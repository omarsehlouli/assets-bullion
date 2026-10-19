import {MarketingCompositions} from './marketing/MarketingCompositions';
import {PremiumCompositions} from './marketing-premium/PremiumCompositions';
import {Premium2Compositions} from './marketing-premium-2/Premium2Compositions';
import {Premium3Compositions} from './marketing-premium-3/Premium3Compositions';
import {StoryCompositions} from './marketing-story/StoryCompositions';
import {Composition, Folder} from 'remotion';
import {BullionBriefComposition} from './bullion/BullionBrief';
import {BullionBackdrop} from './bullion/components/BullionBackdrop';
import {ConclusionSceneComposition} from './bullion/scenes/ConclusionScene';
import {HeadwindsSceneComposition} from './bullion/scenes/HeadwindsScene';
import {InflationSceneComposition} from './bullion/scenes/InflationScene';
import {OutroSceneComposition} from './bullion/scenes/OutroScene';
import {SentimentSceneComposition} from './bullion/scenes/SentimentScene';
import {SupportSceneComposition} from './bullion/scenes/SupportScene';
import {ThesisSceneComposition} from './bullion/scenes/ThesisScene';
import {Backdrop} from './components/Backdrop';
import {Hud} from './components/Hud';
import {MetalsBriefComposition} from './MetalsBrief';
import {CatalystSceneComposition} from './scenes/CatalystScene';
import {EnergySceneComposition} from './scenes/EnergyScene';
import {IntroSceneComposition} from './scenes/IntroScene';
import {MacroSceneComposition} from './scenes/MacroScene';
import {MetalsSceneComposition} from './scenes/MetalsScene';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <PremiumCompositions />
      <Premium2Compositions />
      <Premium3Compositions />
      <StoryCompositions />
      <MarketingCompositions />
      <BullionBriefComposition />
      <Folder name="Bullion-Scenes">
        <ThesisSceneComposition />
        <HeadwindsSceneComposition />
        <InflationSceneComposition />
        <SentimentSceneComposition />
        <SupportSceneComposition />
        <ConclusionSceneComposition />
        <OutroSceneComposition />
        <Composition
          id="BullionBackdrop"
          component={BullionBackdrop}
          durationInFrames={3900}
          fps={60}
          width={1080}
          height={1920}
          defaultProps={{nodeCount: 80}}
        />
      </Folder>
      <MetalsBriefComposition />
      <Folder name="Scenes">
        <IntroSceneComposition />
        <MetalsSceneComposition />
        <MacroSceneComposition />
        <EnergySceneComposition />
        <CatalystSceneComposition />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Backdrop"
          component={Backdrop}
          durationInFrames={1800}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{particleCount: 90}}
        />
        <Composition
          id="Hud"
          component={Hud}
          durationInFrames={1800}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{brand: 'METALS BRIEF', dateLabel: 'MON · JUN 22, 2026'}}
        />
      </Folder>
    </>
  );
};
