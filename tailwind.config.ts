import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // 覆盖 Tailwind 默认的 primary 色
        green: {
          // 将绿色重定向到我们的 primary 色
          50: '#f5f1f4',
          100: '#ebe3e9',
          200: '#d7c7d3',
          300: '#c3abbd',
          400: '#af8fa7',
          500: '#563950',
          600: '#4a3044',
          700: '#3d2738',
          800: '#311e2c',
          900: '#241520',
          950: '#180c14',
        },
        // 自定义主题色
        primary: {
          50: '#f5f1f4',
          100: '#ebe3e9',
          200: '#d7c7d3',
          300: '#c3abbd',
          400: '#af8fa7',
          500: '#563950', // 基准色 - 深紫褐色
          600: '#4a3044',
          700: '#3d2738',
          800: '#311e2c',
          900: '#241520',
          950: '#180c14',
        },
        accent: {
          50: '#fffef5',
          100: '#fffceb',
          200: '#fff9d6',
          300: '#fff6c2',
          400: '#fff3ad',
          500: '#FAED25', // 强调色 - 亮黄色
          600: '#d4c91f',
          700: '#aea519',
          800: '#888113',
          900: '#625d0d',
          950: '#3c3908',
        },
        secondary: {
          50: '#f6f5f6',
          100: '#edecee',
          200: '#dbd9dc',
          300: '#c9c6cb',
          400: '#b7b3b9',
          500: '#5B5561', // 搭配色 - 灰紫色
          600: '#4d4852',
          700: '#403c43',
          800: '#322f34',
          900: '#252225',
          950: '#171517',
        },
      },
      fontFamily: {
        'MiSans': ['MiSans', 'sans-serif'],
        'Dancing': ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
