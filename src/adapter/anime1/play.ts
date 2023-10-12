import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

export async function playModule() {
  const fn = (video: HTMLVideoElement) => {
    if (!video.src)
      return;
    $(video).parent().after('<div id="k-player-container"/>').remove();
    const player = new KPlayer("#k-player-container");
    player.src = video.src;
  };

  const videos = document.querySelectorAll<HTMLVideoElement>("video");
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const ob = new MutationObserver(() => fn(video));
    ob.observe(video, { attributes: true, attributeFilter: ["src"] });
    fn(video);
  }
}
