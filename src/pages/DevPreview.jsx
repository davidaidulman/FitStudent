// DEV ONLY — renders authed screens with a fake profile so the team can
// preview UI without a database. Not linked from anywhere; remove for prod.
import { AuthContext } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import Home from './Home'
import Nutrition from './Nutrition'
import Workouts from './Workouts'
import Profile from './Profile'
import { useSearchParams } from 'react-router-dom'

const fakeProfile = {
  id: 'dev-preview',
  nickname: 'דמו',
  age: 24,
  gender: 'male',
  height_cm: 178,
  weight_kg: 75,
  target_weight_kg: 80,
  body_type: 'meso',
  goal: 'bulk',
  activity_level: 'moderate',
  workouts_per_week: 4,
  experience: 'intermediate',
  dietary_restrictions: [],
  bmr: 1748,
  tdee: 2709,
  calorie_target: 3009,
  protein_target_g: 150,
  carbs_target_g: 519,
  fat_target_g: 84,
}

const fakeAuth = {
  session: { user: { id: 'dev-preview', email: 'dev@preview.local' } },
  user: { id: 'dev-preview', email: 'dev@preview.local' },
  profile: fakeProfile,
  loading: false,
  setupBusy: false,
  setSetupBusy: () => {},
  refreshProfile: async () => fakeProfile,
  loadProfile: async () => fakeProfile,
  signOut: async () => {},
}

const SCREENS = { home: Home, nutrition: Nutrition, workouts: Workouts, profile: Profile }

export default function DevPreview() {
  const [params] = useSearchParams()
  const Screen = SCREENS[params.get('screen')] || Home
  return (
    <AuthContext.Provider value={fakeAuth}>
      <Screen />
      <BottomNav />
    </AuthContext.Provider>
  )
}
