import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BagItem } from '../bag/shared/bag-shared.service';
import { Talent } from '../talents/shared/talents-shared.service';
import { LocalGameSessionData } from '../game-session-storage.service';
import { GameSessionSharedService } from '../game-session-shared.service';
import { SkillRow } from '../skills/shared/skills-shared.service';
import { Spell } from '../spells/shared/spells-shared.service';

interface PlayerInfo {
  name: string;
  character: string;
  alive: boolean;
}

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.scss']
})
export class GameSessionComponent implements OnInit {
  ngOnInit(): void {
    // TODO: implement logic
  }
}
