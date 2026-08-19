# Tomb of the Mask

[English version](README.md) · [← Портфолио](../README_RU.md)

![Cocos Creator](https://shieldcn.dev/badge/Cocos_Creator-3.8.8-55c2e0.svg)
![Maze](https://shieldcn.dev/badge/Genre-Maze_Action-f97316.svg)

Свайповая maze-playable, вдохновлённая Tomb of the Mask. Совершайте рывки до стены, собирайте ключи и кристаллы, проходите поворачивающиеся комнаты и избегайте ловушек и врагов.

## Галерея

<img src="_images/0_lvl1_start.png" width="150" alt="Level 1 start" />
<img src="_images/1_lvl1_half.png" width="150" alt="Level 1 progress" />
<img src="_images/2_lvl1_complete.png" width="150" alt="Level 1 complete" />
<img src="_images/3_lvl2_start.png" width="150" alt="Level 2 start" />
<img src="_images/4_lvl2_half.png" width="150" alt="Level 2 progress" />
<img src="_images/5_lvl2_complete.png" width="150" alt="Level 2 complete" />
<img src="_images/6_lvl3_start.png" width="150" alt="Level 3 start" />
<img src="_images/7_lvl3_half.png" width="150" alt="Level 3 progress" />
<img src="_images/8_lvl3_complete.png" width="150" alt="Level 3 complete" />
<img src="_images/9_lvl4_start.png" width="150" alt="Level 4 start" />
<img src="_images/10_lvl4_half_1.png" width="150" alt="Level 4 progress" />
<img src="_images/11_lvl_4_half_2.png" width="150" alt="Level 4 progress" />
<img src="_images/12_lv4_complete.png" width="150" alt="Level 4 complete" />
<img src="_images/13_end.png" width="150" alt="End" />

## Особенности

- Рывки по сторонам света и прохождение комнат.
- Ключи, ворота, кристаллы, опасности и враги.
- Поворот комнат, экраны победы/поражения, звук и playable CTA.

## Ключевые файлы

- `assets/scripts/GameManager.ts` — игровой поток.
- `assets/scripts/CharacterMovement.ts` — движение игрока.
- `assets/scripts/RoomRotator.ts` — поворот комнат.
- `assets/scripts/Enemy.ts` и `Gate.ts` — угрозы и прогресс.
- `assets/scene.scene` — главная сцена.

## Запуск

Откройте папку в Cocos Creator 3.8.8. Для проверки TypeScript выполните `npx tsc --noEmit`.
