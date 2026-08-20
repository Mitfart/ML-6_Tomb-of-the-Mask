# Tomb of the Mask

[← Portfolio](../README.md) · [Русская версия](README_RU.md)

![Cocos Creator](https://shieldcn.dev/badge/Cocos_Creator-3.8.8-55c2e0.svg)
![Maze](https://shieldcn.dev/badge/Genre-Maze_Action-f97316.svg)

A swipe-controlled maze playable inspired by Tomb of the Mask. Dash until walls stop you, collect keys and gems, navigate rotating rooms, and avoid traps and enemies.

## Gallery

<table>
<tr>
  <td><img src="images/0_lvl1_start.png" width="210" alt="Level 1 start" /></td>
  <td><img src="images/1_lvl1_half.png" width="210" alt="Level 1 progress" /></td>
  <td><img src="images/2_lvl1_complete.png" width="210" alt="Level 1 complete" /></td>
  <td><img src="images/3_lvl2_start.png" width="210" alt="Level 2 start" /></td>
</tr>
<tr>
  <td><img src="images/4_lvl2_half.png" width="210" alt="Level 2 progress" /></td>
  <td><img src="images/5_lvl2_complete.png" width="210" alt="Level 2 complete" /></td>
  <td><img src="images/6_lvl3_start.png" width="210" alt="Level 3 start" /></td>
  <td><img src="images/7_lvl3_half.png" width="210" alt="Level 3 progress" /></td>
</tr>
<tr>
  <td><img src="images/8_lvl3_complete.png" width="210" alt="Level 3 complete" /></td>
  <td><img src="images/9_lvl4_start.png" width="210" alt="Level 4 start" /></td>
  <td><img src="images/10_lvl4_half_1.png" width="210" alt="Level 4 progress" /></td>
  <td><img src="images/11_lvl_4_half_2.png" width="210" alt="Level 4 progress" /></td>
</tr>
<tr>
  <td><img src="images/12_lv4_complete.png" width="210" alt="Level 4 complete" /></td>
  <td><img src="images/13_end.png" width="210" alt="End" /></td>
</tr>
</table>

## Highlights

- Cardinal dash movement and room-based progression.
- Keys, gates, gems, hazards, and enemies.
- Rotating rooms, win/fail screens, audio, and playable CTA.

## Key files

- `assets/scripts/GameManager.ts` — game flow.
- `assets/scripts/CharacterMovement.ts` — player movement.
- `assets/scripts/RoomRotator.ts` — rotating-room behavior.
- `assets/scripts/Enemy.ts` and `Gate.ts` — threats and progression.
- `assets/scene.scene` — main scene.

## Run

Open this folder in Cocos Creator 3.8.8. Run `npx tsc --noEmit` to type-check the TypeScript project.
