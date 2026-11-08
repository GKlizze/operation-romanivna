import { Shell } from '../components/Shell'
import { useGame } from '../game/GameContext'
import { Welcome } from './Welcome'
import { Level1Vibe } from './Level1Vibe'
import { Level2Menu } from './Level2Menu'
import { Level3Kisses } from './Level3Kisses'
import { Level4EitherOr } from './Level4EitherOr'
import { Level5Envelope } from './Level5Envelope'
import { Level6Hours } from './Level6Hours'
import { Level7Wish } from './Level7Wish'
import { Final } from './Final'

function Step({ step }: { step: number }) {
  switch (step) {
    case 0:
      return <Welcome />
    case 1:
      return <Level1Vibe />
    case 2:
      return <Level2Menu />
    case 3:
      return <Level3Kisses />
    case 4:
      return <Level4EitherOr />
    case 5:
      return <Level5Envelope />
    case 6:
      return <Level6Hours />
    case 7:
      return <Level7Wish />
    default:
      return <Final />
  }
}

export function Game() {
  const { state } = useGame()
  return (
    <Shell>
      <Step step={state.step} />
    </Shell>
  )
}
