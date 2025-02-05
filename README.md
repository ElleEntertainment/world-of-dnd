# World of DnD

A companion app for Dungeons and Dragons players. 

The main goal is to reproduce World of Warcraft UI for DnD players to use during their games. It will be a cool character sheet with lot of details!

## How to run the app

1. Clone the repository
2. Run `docker-compose -p world-of-dnd up -d`
3. Open your browser and go to `http://localhost:8081`

## Warning

At the moment of the first start, the database will be empty (no spells, no auth, no save). I will consider to add a seed script in the future.

## Milestones

1. Recreate a static version of the UI
2. Add a backend to store the data (differentiated by 3.5 and 5e)
3. Add a way to store the current progress (character info, saved spells on spellbar etc...)
4. Add authentication
5. Add a way to share the character with the DM
6. To be continued...