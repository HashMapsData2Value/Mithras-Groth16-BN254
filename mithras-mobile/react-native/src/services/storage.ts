// Used to store non-sensitive data like network configuration. Not encrypted, so don't put secrets here.

import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()