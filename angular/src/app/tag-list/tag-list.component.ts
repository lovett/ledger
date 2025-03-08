import { Component, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Tag } from '../tag';
import { TagService } from '../tag.service';

@Component({
  selector: 'app-tag-list',
  imports: [RouterLink, AsyncPipe, DecimalPipe],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.css'
})
export class TagListComponent {
  tags$: Observable<Tag[]> = of([]);

  constructor(
    private tagService: TagService,
  ) {
  }

  ngOnInit() {
    this.tags$ = this.tagService.getTags();
  }

  rename(event: Event, tag: Tag) {
    event.preventDefault();
    const oldName = tag.name;
    const promptResponse = prompt(`Rename ${tag.name} to:`);

    if (!promptResponse || promptResponse.trim() === '') {
      return;
    }

    tag.name = promptResponse.trim();
    this.tagService.saveTag(tag).subscribe({
      error: (err: Error) => {
        tag.name = oldName;
        console.log(err);
      }
    });
  }
}
