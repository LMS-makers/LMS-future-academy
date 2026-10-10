import { PartialType } from '@nestjs/swagger';
import { CreateCourseTopicDto } from './create-course-topic.dto.js';

export class UpdateCourseTopicDto extends PartialType(CreateCourseTopicDto) {}
