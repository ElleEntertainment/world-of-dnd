import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CommonModule } from '@angular/common';
import { GameSessionComponent } from './game-session.component';
import { BagModalComponent } from './bag/bag-modal.component';
import { CoinsModalComponent } from './bag/coins-modal.component';
import { SpellsModalComponent } from './spells/spells-modal.component';
import { TalentsModalComponent } from './talents/talents-modal.component';
import { CharacterModalComponent } from './character/character-modal.component';
import { SkillsModalComponent } from './skills/skills-modal.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AnnotazioniModalComponent } from './annotazioni-modal/annotazioni-modal.component';
import { EberronMapDialogComponent } from './eberron-map-dialog.component';

const routes: Routes = [
  { path: ':id', component: GameSessionComponent },
  // puoi aggiungere altre route qui se necessario
];

@NgModule({
  declarations: [
    GameSessionComponent,
    BagModalComponent,
    CoinsModalComponent,
    SpellsModalComponent,
    TalentsModalComponent,
    CharacterModalComponent,
    SkillsModalComponent,
    EberronMapDialogComponent,
    AnnotazioniModalComponent
  ],
  imports: [
    CKEditorModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class GameSessionModule { }
