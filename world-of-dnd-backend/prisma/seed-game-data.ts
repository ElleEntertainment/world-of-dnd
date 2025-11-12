import { PrismaClient } from '../generated/prisma';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting game data seed...');

  // Seed Skills
  const skills = [
    { name: 'Acrobazia', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di compiere acrobazie e movimenti agili' },
    { name: 'Addestrare Animali', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di addestrare animali' },
    { name: 'Artigianato', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Abilità di creare oggetti artigianali' },
    { name: 'Artista della Fuga', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di sfuggire da legature' },
    { name: 'Ascoltare', keyAbility: 'SAG', keyAbilityShort: 'saggezza', description: 'Abilità di percepire suoni' },
    { name: 'Camuffare', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di camuffarsi' },
    { name: 'Cavalcare', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di cavalcare animali' },
    { name: 'Cercare', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Abilità di cercare oggetti nascosti' },
    { name: 'Concentrazione', keyAbility: 'COS', keyAbilityShort: 'costituzione', description: 'Abilità di mantenere la concentrazione' },
    { name: 'Conoscenze (Arcane)', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Conoscenza di magia e arcani' },
    { name: 'Conoscenze (Storia)', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Conoscenza di storia' },
    { name: 'Conoscenze (Natura)', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Conoscenza della natura' },
    { name: 'Conoscenze (Religioni)', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Conoscenza di religioni' },
    { name: 'Conoscenze (Piani)', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Conoscenza dei piani di esistenza' },
    { name: 'Decifrare Scritture', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Abilità di decifrare scritture' },
    { name: 'Diplomazia', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità diplomatiche' },
    { name: 'Disattivare Congegni', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Abilità di disattivare trappole' },
    { name: 'Equilibrio', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di mantenere l\'equilibrio' },
    { name: 'Falsificare', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Abilità di falsificare documenti' },
    { name: 'Guarire', keyAbility: 'SAG', keyAbilityShort: 'saggezza', description: 'Abilità di curare ferite' },
    { name: 'Intimidire', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di intimidire' },
    { name: 'Intrattenere', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di intrattenere un pubblico' },
    { name: 'Muoversi Silenziosamente', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di muoversi senza fare rumore' },
    { name: 'Nascondersi', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di nascondersi' },
    { name: 'Nuotare', keyAbility: 'FOR', keyAbilityShort: 'forza', description: 'Abilità di nuotare' },
    { name: 'Osservare', keyAbility: 'SAG', keyAbilityShort: 'saggezza', description: 'Abilità di osservare dettagli' },
    { name: 'Percepire Intenzioni', keyAbility: 'SAG', keyAbilityShort: 'saggezza', description: 'Abilità di percepire intenzioni' },
    { name: 'Professione', keyAbility: 'SAG', keyAbilityShort: 'saggezza', description: 'Conoscenza professionale' },
    { name: 'Raccogliere Informazioni', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di raccogliere informazioni' },
    { name: 'Raggirare', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di raggirare qualcuno' },
    { name: 'Rapidità di Mano', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di borseggiare' },
    { name: 'Saltare', keyAbility: 'FOR', keyAbilityShort: 'forza', description: 'Abilità di saltare' },
    { name: 'Sapienza Magica', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Conoscenza della magia' },
    { name: 'Scalare', keyAbility: 'FOR', keyAbilityShort: 'forza', description: 'Abilità di scalare' },
    { name: 'Scassinare Serrature', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di scassinare serrature' },
    { name: 'Sopravvivenza', keyAbility: 'SAG', keyAbilityShort: 'saggezza', description: 'Abilità di sopravvivere in natura' },
    { name: 'Utilizzare Corde', keyAbility: 'DES', keyAbilityShort: 'destrezza', description: 'Abilità di utilizzare corde' },
    { name: 'Utilizzare Oggetti Magici', keyAbility: 'CAR', keyAbilityShort: 'carisma', description: 'Abilità di utilizzare oggetti magici' },
    { name: 'Valutare', keyAbility: 'INT', keyAbilityShort: 'intelligenza', description: 'Abilità di valutare oggetti' },
  ];

  console.log('Seeding skills...');
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: skills.indexOf(skill) + 1 },
      update: skill,
      create: skill,
    });
  }
  console.log(`Created ${skills.length} skills`);

  // Seed Spells
  const spells = [
    { name: 'Palla di Fuoco', description: 'Lancia una palla di fuoco che infligge 8d6 danni da fuoco.', level: 3, school: 'Evocazione', castingTime: '1 azione standard', range: '120m', components: 'V, S, M', duration: 'Istantaneo', icon: '' },
    { name: 'Cura Ferite', description: 'Cura 2d8+3 punti ferita a un bersaglio.', level: 1, school: 'Evocazione', castingTime: '1 azione standard', range: 'Contatto', components: 'V, S', duration: 'Istantaneo', icon: '' },
    { name: 'Dardo di Ghiaccio', description: 'Colpisce il nemico con un dardo gelido.', level: 1, school: 'Evocazione', castingTime: '1 azione standard', range: '36m', components: 'V, S', duration: 'Istantaneo', icon: '' },
    { name: 'Scudo Magico', description: 'Aumenta la CA di +4 per 1 minuto.', level: 1, school: 'Abiurazione', castingTime: '1 azione immediata', range: 'Personale', components: 'V, S', duration: '1 minuto', icon: '' },
    { name: 'Fulmine', description: 'Infligge 4d8 danni da elettricità a una linea.', level: 3, school: 'Evocazione', castingTime: '1 azione standard', range: '36m', components: 'V, S, M', duration: 'Istantaneo', icon: '' },
    { name: 'Invisibilità', description: 'Diventi invisibile per 1 minuto.', level: 2, school: 'Illusione', castingTime: '1 azione standard', range: 'Personale o contatto', components: 'V, S, M', duration: '1 min/livello', icon: '' },
    { name: 'Benedizione', description: 'Dona +1 ai tiri per colpire e ai TS.', level: 1, school: 'Ammaliamento', castingTime: '1 azione standard', range: '15m', components: 'V, S, FD', duration: '1 min/livello', icon: '' },
    { name: 'Maledizione', description: 'Riduce le caratteristiche del bersaglio.', level: 3, school: 'Necromanzia', castingTime: '1 azione standard', range: 'Contatto', components: 'V, S', duration: 'Permanente', icon: '' },
    { name: 'Velocità', description: 'Raddoppia la velocità per 1 minuto.', level: 3, school: 'Trasmutazione', castingTime: '1 azione standard', range: 'Vicino', components: 'V, S, M', duration: '1 round/livello', icon: '' },
    { name: 'Lentezza', description: 'Dimezza la velocità del bersaglio.', level: 3, school: 'Trasmutazione', castingTime: '1 azione standard', range: 'Vicino', components: 'V, S, M', duration: '1 round/livello', icon: '' },
    { name: 'Paura', description: 'Il bersaglio fugge per 2 turni.', level: 4, school: 'Necromanzia', castingTime: '1 azione standard', range: '9m', components: 'V, S', duration: '1 round/livello', icon: '' },
    { name: 'Sonno', description: 'Addormenta fino a 4 creature.', level: 1, school: 'Ammaliamento', castingTime: '1 round', range: 'Medio', components: 'V, S, M', duration: '1 min/livello', icon: '' },
    { name: 'Veleno', description: 'Infligge danni nel tempo.', level: 3, school: 'Necromanzia', castingTime: '1 azione standard', range: 'Contatto', components: 'V, S, FD', duration: 'Istantaneo', icon: '' },
    { name: 'Purificazione', description: 'Rimuove effetti negativi.', level: 2, school: 'Abiurazione', castingTime: '1 azione standard', range: 'Contatto', components: 'V, S', duration: 'Istantaneo', icon: '' },
    { name: 'Evoca Mostri I', description: 'Evoca un piccolo aiutante.', level: 1, school: 'Evocazione', castingTime: '1 round', range: 'Vicino', components: 'V, S, FD/FA', duration: '1 round/livello', icon: '' },
    { name: 'Teletrasporto', description: 'Ti sposti istantaneamente.', level: 5, school: 'Evocazione', castingTime: '1 azione standard', range: 'Personale e contatto', components: 'V', duration: 'Istantaneo', icon: '' },
  ];

  console.log('Seeding spells...');
  for (const spell of spells) {
    await prisma.spell.upsert({
      where: { id: spells.indexOf(spell) + 1 },
      update: spell,
      create: spell,
    });
  }
  console.log(`Created ${spells.length} spells`);

  // Seed Talents
  const talents = [
    { name: 'Attacco Poderoso', description: 'Puoi sacrificare precisione per infliggere più danni.', prerequisites: 'FOR 13+', icon: '' },
    { name: 'Colpo a Catena', description: 'Se abbatti un nemico, puoi attaccarne subito un altro.', prerequisites: 'FOR 13+, Attacco Poderoso', icon: '' },
    { name: 'Schivare', description: 'Ottieni un bonus alla CA contro un avversario scelto.', prerequisites: 'DES 13+', icon: '' },
    { name: 'Tempra', description: 'Ottieni +3 punti ferita.', prerequisites: null, icon: '' },
    { name: 'Competenza in Arma (Spada Lunga)', description: 'Bonus +1 ai tiri per colpire con la spada lunga.', prerequisites: null, icon: '' },
    { name: 'Iniziativa Migliorata', description: 'Bonus +4 all\'iniziativa.', prerequisites: null, icon: '' },
    { name: 'Arma Focalizzata', description: '+1 ai tiri per colpire con un\'arma scelta.', prerequisites: 'Competenza nell\'arma', icon: '' },
    { name: 'Incantesimi in Combattimento', description: 'Lancia incantesimi in mischia senza penalità.', prerequisites: null, icon: '' },
    { name: 'Mobilità', description: '+4 CA contro attacchi di opportunità durante il movimento.', prerequisites: 'DES 13+, Schivare', icon: '' },
    { name: 'Colpo Preciso', description: '+1d6 danni quando attacchi con precisione.', prerequisites: 'DES 13+, Attacco Furtivo', icon: '' },
  ];

  console.log('Seeding talents...');
  for (const talent of talents) {
    await prisma.talent.upsert({
      where: { id: talents.indexOf(talent) + 1 },
      update: talent,
      create: talent,
    });
  }
  console.log(`Created ${talents.length} talents`);

  console.log('Game data seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding game data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
