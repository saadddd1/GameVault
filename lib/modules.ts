// 模块注册表 — 集中管理所有内容类型，搜索/下载/统计不需要硬编码每个模块

import type { Game } from './games'
import type { Mod } from './mod'
import type { AndroidApp } from './android'
import type { WindowsApp } from './windows'

// 注意: lib/mod.ts 的 DataStore 实例在这里不需要直接引用
// 搜索/下载需要调用的函数由各 lib 文件导出，这里只做类型注册

export type ModuleKey = 'game' | 'mod' | 'android' | 'windows'

export interface ModuleDef {
  key: ModuleKey
  label: string
  searchFields: string[]         // 搜索匹配的字段名
  routePrefix: string            // 路由前缀: 'games', 'mods', 'android', 'windows'
}

export const SEARCHABLE_MODULES: ModuleDef[] = [
  { key: 'game',     label: '游戏',        searchFields: ['title', 'description', 'category'],        routePrefix: 'games' },
  { key: 'mod',      label: 'MOD',         searchFields: ['title', 'description', 'gameName', 'category'], routePrefix: 'mods' },
  { key: 'android',  label: '安卓软件',    searchFields: ['name', 'description', 'category'],         routePrefix: 'android' },
  { key: 'windows',  label: 'Windows软件', searchFields: ['name', 'description', 'category'],         routePrefix: 'windows' },
]

export function getModule(key: string): ModuleDef | undefined {
  return SEARCHABLE_MODULES.find(m => m.key === key)
}

export type { Game, Mod, AndroidApp, WindowsApp }
