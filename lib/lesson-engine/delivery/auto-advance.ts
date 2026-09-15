import type {SceneDef} from '../types';
/** Reduce Next taps without skipping exploration, speech conversations, or feedback.
 * Completion comes from evidence; a finished clip alone cannot solve an activity. */
export function lessonAutoAdvanceDelay(state:{
 scene:SceneDef;complete:boolean;started:boolean;finished:boolean;warmupReady:boolean;
 speechFinished:boolean;audioError:boolean;capturing:boolean;retrying:boolean;paused:boolean;visible:boolean;
}):number|null{
 if(!state.started||state.finished||!state.warmupReady||!state.speechFinished||state.audioError||state.capturing||state.retrying||state.paused||!state.visible)return null;
 const i=state.scene.interaction;
 // Children control demonstrations; open conversations may still have a Why turn.
 if(i?.type==='transform'||i?.type==='listen'||(i?.type==='speak'&&i.mode==='respond'))return null;
 if(i?!state.complete:state.scene.gate!=='none')return null;
 return 2000; // Let the child see the completed sentence, picture or animation.
}
