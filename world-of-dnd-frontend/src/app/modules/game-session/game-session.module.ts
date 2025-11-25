import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CommonModule } from '@angular/common';
import { GameSessionComponent } from './game-session.component';
import { SessionsListComponent } from './sessions-list/sessions-list.component';
import { BagModalComponent } from './bag/bag-modal.component';
import { CoinsModalComponent } from './bag/coins-modal.component';
import { SpellsModalComponent } from './spells/spells-modal.component';
import { TalentsModalComponent } from './talents/talents-modal.component';
import { CharacterModalComponent } from './character/character-modal.component';
import { SkillsModalComponent } from './skills/skills-modal.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AnnotazioniModalComponent } from './annotazioni-modal/annotazioni-modal.component';
import { EberronMapDialogComponent } from './eberron-map/eberron-map-dialog.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';

const routes: Routes = [
  { path: '', component: SessionsListComponent },
  { path: ':id', component: GameSessionComponent },
];

@NgModule({
  declarations: [
    SessionsListComponent,
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
    RouterModule.forChild(routes),
    LeafletModule,
    LeafletDrawModule
  ]
})
export class GameSessionModule { }
