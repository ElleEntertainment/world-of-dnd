import { Component } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { GameSessionStorageService, LocalGameSessionData } from '../game-session-storage.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-annotazioni-modal',
  templateUrl: './annotazioni-modal.component.html',
  styleUrls: ['./annotazioni-modal.component.scss'],
})
export class AnnotazioniModalComponent {
  public Editor: any = ClassicEditor;
  public editorConfig = {
    removePlugins: ['EasyImage', 'ImageUpload']
  };
  public data: string = '';
  public show: boolean = false;
  private sessionId: string | null = null;

  constructor(
    private storage: GameSessionStorageService,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('id');
    });
  }

  open() {
    const session = this.storage.load(this.sessionId);
    this.data = session?.annotazioni || '';
    this.show = true;
  }

  close() {
    this.show = false;
  }

  save() {
    const session = this.storage.load(this.sessionId) || {} as LocalGameSessionData;
    session.annotazioni = this.data;
    this.storage.save(this.sessionId, session);
    this.close();
  }
}
