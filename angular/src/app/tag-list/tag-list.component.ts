import { Component, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Tag } from '../tag';
import { TagService } from '../tag.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-tag-list',
  imports: [RouterLink, AsyncPipe, DecimalPipe, ButtonComponent],
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

  delete(event: Event, tag: Tag) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (tag.transaction_count > 0) {
      const confirmation = confirm(`Remove ${tag.name} from all transactions?`);
      if (!confirmation) return;
    }

    this.tagService.deleteTag(tag.id).subscribe({
      next: () => {
        const node = target.closest('.tag') as HTMLElement;
        node.parentNode!.removeChild(node);
      },
      error: (err: Error) => {
        console.log(err);
      }
    });
  }

  rename(event: Event, tag: Tag) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const oldName = tag.name;
    const promptResponse = prompt(`Rename ${oldName} to:`, oldName);

    if (!promptResponse || promptResponse.trim() === '') {
      return;
    }

    tag.name = promptResponse.trim();
    this.tagService.saveTag(tag).subscribe({
      next: () => {
        target.closest('details')?.removeAttribute('open');
      },
      error: (err: Error) => {
        tag.name = oldName;
        console.log(err);
      }
    });
  }
}
