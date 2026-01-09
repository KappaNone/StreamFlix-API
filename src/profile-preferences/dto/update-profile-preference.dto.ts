import { PartialType } from '@nestjs/swagger';
import { CreateProfilePreferenceDto } from './create-profile-preference.dto';

export class UpdateProfilePreferenceDto extends PartialType(
  CreateProfilePreferenceDto,
) {}
