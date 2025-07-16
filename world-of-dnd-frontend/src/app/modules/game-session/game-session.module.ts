import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { GameSessionComponent } from './game-session.component';
import { BagModalComponent } from './bag/bag-modal.component';
import { CoinsModalComponent } from './bag/coins-modal.component';
import { AbilitiesModalComponent } from './abilities/abilities-modal.component';
import { TalentsModalComponent } from './talents/talents-modal.component';

const routes: Routes = [
  { path: ':id', component: GameSessionComponent },
  // puoi aggiungere altre route qui se necessario
];

@NgModule({
  declarations: [
    GameSessionComponent,
    BagModalComponent,
    CoinsModalComponent,
    AbilitiesModalComponent,
    TalentsModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class GameSessionModule { }
