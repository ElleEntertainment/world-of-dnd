import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';

@Injectable()
export class GameSessionService {
    constructor(private prisma: PrismaService) { }

    // Crea una nuova game session
    async create(userId: number, createDto: CreateGameSessionDto) {
        return this.prisma.gameSession.create({
            data: {
                name: createDto.name,
                description: createDto.description,
                userId,
            },
        });
    }

    // Ottieni tutte le game sessions dell'utente autenticato
    async findAllByUser(userId: number) {
        return this.prisma.gameSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { characters: true },
                },
            },
        });
    }

    // Ottieni dettaglio di una game session con characters
    async findOne(id: number, userId: number) {
        const session = await this.prisma.gameSession.findUnique({
            where: { id },
            include: {
                characters: {
                    include: {
                        skills: {
                            include: { skill: true },
                        },
                        spells: {
                            include: { spell: true },
                        },
                        talents: {
                            include: { talent: true },
                        },
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Game session non trovata');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Non hai accesso a questa game session');
        }

        return session;
    }

    // Aggiorna una game session
    async update(id: number, userId: number, updateDto: UpdateGameSessionDto) {
        // Verifica proprietà
        await this.findOne(id, userId);

        return this.prisma.gameSession.update({
            where: { id },
            data: updateDto,
        });
    }

    // Elimina una game session
    async remove(id: number, userId: number) {
        // Verifica proprietà
        await this.findOne(id, userId);

        return this.prisma.gameSession.delete({
            where: { id },
        });
    }

    // Sincronizza dati dal frontend (persistenza completa di characters e relazioni)
    async sync(id: number, userId: number, data: any) {
        // Verifica proprietà e ownership
        await this.findOne(id, userId);

        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;

        // Esegui tutto in una transaction per garantire consistenza
        return this.prisma.$transaction(async (tx) => {
            // Aggiorna metadati della sessione se presenti
            if (Object.keys(updateData).length > 0) {
                await tx.gameSession.update({
                    where: { id },
                    data: updateData,
                });
            }

            // Persisti characters e relative tabelle (semplice strategia: upsert + delete/ricrea relazioni)
            if (Array.isArray(data.characters)) {
                for (const ch of data.characters) {
                    let character;
                    if (ch.id && ch.id > 0) {
                        // Aggiorna character esistente
                        character = await tx.character.update({
                            where: { id: ch.id },
                            data: {
                                name: ch.name,
                                race: ch.race,
                                class: ch.class,
                                level: ch.level,
                                experience: ch.experience,
                                strength: ch.strength,
                                dexterity: ch.dexterity,
                                constitution: ch.constitution,
                                intelligence: ch.intelligence,
                                wisdom: ch.wisdom,
                                charisma: ch.charisma,
                                hitPoints: ch.hitPoints,
                                maxHitPoints: ch.maxHitPoints,
                                armorClass: ch.armorClass,
                                initiative: ch.initiative,
                                notes: ch.notes,
                                avatarUrl: ch.avatarUrl,
                            },
                        });
                    } else {
                        // Crea nuovo character
                        character = await tx.character.create({
                            data: {
                                gameSessionId: id,
                                name: ch.name,
                                race: ch.race,
                                class: ch.class,
                                level: ch.level || 1,
                                experience: ch.experience || 0,
                                strength: ch.strength ?? 10,
                                dexterity: ch.dexterity ?? 10,
                                constitution: ch.constitution ?? 10,
                                intelligence: ch.intelligence ?? 10,
                                wisdom: ch.wisdom ?? 10,
                                charisma: ch.charisma ?? 10,
                                hitPoints: ch.hitPoints || 0,
                                maxHitPoints: ch.maxHitPoints || 0,
                                armorClass: ch.armorClass || 10,
                                initiative: ch.initiative || 0,
                                notes: ch.notes,
                                avatarUrl: ch.avatarUrl,
                            },
                        });
                    }

                    const charId = character.id;

                    // Sostituisci skills: rimuovi e ricrea
                    await tx.characterSkill.deleteMany({ where: { characterId: charId } });
                    if (Array.isArray(ch.skills) && ch.skills.length) {
                        await tx.characterSkill.createMany({
                            data: ch.skills.map((s: any) => ({
                                characterId: charId,
                                skillId: s.skillId,
                                checked: !!s.checked,
                                checked2: !!s.checked2,
                                ranks: s.ranks || 0,
                                miscMod: s.miscMod || 0,
                                total: s.total || 0,
                            })),
                            skipDuplicates: true,
                        });
                    }

                    // Sostituisci spells
                    await tx.characterSpell.deleteMany({ where: { characterId: charId } });
                    if (Array.isArray(ch.spells) && ch.spells.length) {
                        await tx.characterSpell.createMany({
                            data: ch.spells.map((sp: any) => ({
                                characterId: charId,
                                spellId: sp.spellId,
                                isPrepared: !!sp.isPrepared,
                                timesUsed: sp.timesUsed || 0,
                            })),
                            skipDuplicates: true,
                        });
                    }

                    // Sostituisci talents
                    await tx.characterTalent.deleteMany({ where: { characterId: charId } });
                    if (Array.isArray(ch.talents) && ch.talents.length) {
                        await tx.characterTalent.createMany({
                            data: ch.talents.map((t: any) => ({
                                characterId: charId,
                                talentId: t.talentId,
                                acquiredAt: t.acquiredAt || 1,
                            })),
                            skipDuplicates: true,
                        });
                    }
                }
            }

            // Salva il payload grezzo nella colonna JSONB `data` della game session
            // in modo che il frontend possa ricaricarlo al refresh.
            // IMPORTANTE: Fare merge con i dati esistenti per non perdere altre informazioni
            try {
                // Carica i dati esistenti
                const existingSession = await tx.gameSession.findUnique({
                    where: { id },
                    select: { data: true }
                });

                // Merge dei nuovi dati con quelli esistenti
                const mergedData = {
                    ...(existingSession?.data as object || {}),
                    ...data
                };

                await tx.gameSession.update({
                    where: { id },
                    data: { data: mergedData }
                });
            } catch (e) {
                // Non fallire l'intera transaction per un problema di salvataggio del JSON.
                // Loggare l'errore per il debugging (il logger globale può essere usato all'esterno).
                // eslint-disable-next-line no-console
                console.warn('Failed to persist session.data JSONB:', e);
            }

            // Ritorna lo stato aggiornato della sessione completo
            return this.findOne(id, userId);
        });
    }

    // Ottieni tutte le skills disponibili con ricerca e paginazione
    async getAllSkills(search?: string, page?: number, limit?: number) {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as any } },
                    { keyAbility: { contains: search, mode: 'insensitive' as any } },
                ],
            }
            : {};

        // If pagination params are not provided, return all results (no pagination)
        if (page === undefined || limit === undefined) {
            const skills = await this.prisma.skill.findMany({
                where,
                orderBy: { name: 'asc' },
            });
            const total = skills.length;
            return {
                data: skills,
                total,
                page: 1,
                limit: total,
                totalPages: 1,
            };
        }

        const [total, skills] = await Promise.all([
            this.prisma.skill.count({ where }),
            this.prisma.skill.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return {
            data: skills,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Ottieni tutti gli spells disponibili con ricerca e paginazione
    async getAllSpells(search?: string, page?: number, limit?: number) {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as any } },
                    { description: { contains: search, mode: 'insensitive' as any } },
                ],
            }
            : {};

        // If pagination params are not provided, return all results (no pagination)
        if (page === undefined || limit === undefined) {
            const spells = await this.prisma.spell.findMany({
                where,
                orderBy: { name: 'asc' },
            });
            const total = spells.length;
            return {
                data: spells,
                total,
                page: 1,
                limit: total,
                totalPages: 1,
            };
        }

        const [total, spells] = await Promise.all([
            this.prisma.spell.count({ where }),
            this.prisma.spell.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return {
            data: spells,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Ottieni tutti i talents disponibili con ricerca e paginazione
    async getAllTalents(search?: string, page?: number, limit?: number) {
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as any } },
                    { description: { contains: search, mode: 'insensitive' as any } },
                ],
            }
            : {};

        // If pagination params are not provided, return all results (no pagination)
        if (page === undefined || limit === undefined) {
            const talents = await this.prisma.talent.findMany({
                where,
                orderBy: { name: 'asc' },
            });
            const total = talents.length;
            return {
                data: talents,
                total,
                page: 1,
                limit: total,
                totalPages: 1,
            };
        }

        const [total, talents] = await Promise.all([
            this.prisma.talent.count({ where }),
            this.prisma.talent.findMany({
                where,
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return {
            data: talents,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
