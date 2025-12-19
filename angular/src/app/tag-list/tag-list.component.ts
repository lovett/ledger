import { Component, inject, OnInit, ElementRef, viewChild } from '@angular/core';
import { AsyncPipe, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { Tag } from '../tag';
import { TagService } from '../tag.service';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-tag-list',
    imports: [
        RouterLink,
        AsyncPipe,
        DecimalPipe,
        ButtonComponent,
        CommonModule,
    ],
    templateUrl: './tag-list.component.html',
    styleUrl: './tag-list.component.css',
})
export class TagListComponent implements OnInit {
    private tagService = inject(TagService);
    dialogRef = viewChild.required<ElementRef>('dialogRef');

    tags$: Observable<Tag[]> = of([]);
    selectedTag?: Tag;
    loading = false;

    ngOnInit() {
        this.loading = true;
        this.tags$ = this.tagService
            .getTags()
            .pipe(tap(() => (this.loading = false)));
    }

    delete(event: Event, tag: Tag) {
        event.preventDefault();
        const target = event.target as HTMLElement;
        if (tag.transaction_count > 0) {
            const confirmation = confirm(
                `Remove the tag "${tag.name}" from all transactions?`,
            );
            if (!confirmation) return;
        }

        this.tagService.deleteTag(tag.id).subscribe({
            next: () => {
                const node = target.closest('.tag') as HTMLElement;
                node.parentNode?.removeChild(node);
            },
            error: (err: Error) => {
                console.log(err);
            },
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
            },
        });
    }

    selectTag(event: Event, tag: Tag) {
        event.preventDefault();
        this.selectedTag = tag;
        this.dialogRef().nativeElement.showModal();
    }
}
