import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateNoteDto } from './create-note.dto';

// Everything from create EXCEPT authorId (a note never changes its author),
// and every field optional.
export class UpdateNoteDto extends PartialType(
  OmitType(CreateNoteDto, ['authorId'] as const),
) {}
