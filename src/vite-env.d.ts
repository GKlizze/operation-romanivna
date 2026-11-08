/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** SHA-256 (hex) пароля організатора. Сам пароль у коді не зберігається. */
  readonly VITE_ADMIN_PASSWORD_HASH?: string
  /** Необов’язковий ендпоінт, куди гра POST-ом надсилає результат після завершення. */
  readonly VITE_SUBMIT_URL?: string
  /** Необов’язковий ендпоінт, з якого адмін-сторінка читає список результатів. */
  readonly VITE_RESULTS_URL?: string
}
