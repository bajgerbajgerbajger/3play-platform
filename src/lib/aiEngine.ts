import OpenAI from 'openai';
import { db } from './db';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is missing');
  }
  return new OpenAI({ apiKey });
};

const HighlightSchema = z.object({
  highlights: z.array(z.object({
    startTime: z.number().describe('Start time in seconds'),
    endTime: z.number().describe('End time in seconds'),
    title: z.string(),
    description: z.string(),
    score: z.number().min(0).max(1).describe('Excitement score'),
  }))
});

export async function analyzeContentForHighlights(contentId: string, type: 'movie' | 'episode') {
  try {
    const openai = getOpenAI();
    const content = type === 'movie' 
      ? await db.movie.findUnique({ where: { id: contentId }, include: { genres: true } })
      : await db.episode.findUnique({ where: { id: contentId }, include: { season: { include: { series: { include: { genres: true } } } } } });

    if (!content) throw new Error('Content not found');

    const title = 'title' in content ? content.title : '';
    const description = content.description || '';
    const duration = content.duration || 3600; // Default 1 hour if unknown
    const genres = 'genres' in content ? content.genres.map(g => g.name).join(', ') : '';

    console.log(`AI Engine: Analyzing "${title}" for exciting scenes...`);

    const prompt = `
      You are an AI platform manager for a premium streaming service. 
      Analyze the following content and identify 5-7 most exciting, thrilling, or key scenes.
      Ensure you skip the intro (first 5% of duration) and credits (last 10% of duration).
      The scenes should be varied and capture the essence of the ${type === 'movie' ? 'movie' : 'series'}.
      
      IMPORTANT: All titles and descriptions for the highlights MUST be in Czech language (čeština).
      
      Content Title: ${title}
      Description: ${description}
      Duration: ${duration} seconds
      Genres: ${genres}
      
      Return the results as a list of highlights with start and end times in seconds.
    `;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert film editor and AI curator. You provide all output in Czech language." },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(HighlightSchema, "highlights"),
    });

    const highlightsData = completion.choices[0].message.parsed?.highlights;

    if (!highlightsData) throw new Error('Failed to parse AI response');

    // Clear existing highlights
    if (type === 'movie') {
      await db.highlight.deleteMany({ where: { movieId: contentId } });
    } else {
      await db.highlight.deleteMany({ where: { episodeId: contentId } });
    }

    // Save new highlights
    await db.highlight.createMany({
      data: highlightsData.map(h => ({
        ...h,
        movieId: type === 'movie' ? contentId : null,
        episodeId: type === 'episode' ? contentId : null,
      }))
    });

    // Mark as processed
    if (type === 'movie') {
      await db.movie.update({ where: { id: contentId }, data: { isAIProcessed: true } });
    } else {
      await db.episode.update({ where: { id: contentId }, data: { isAIProcessed: true } });
    }

    console.log(`AI Engine: Successfully processed "${title}". Found ${highlightsData.length} scenes.`);
    return highlightsData;

  } catch (error) {
    console.error('AI Engine Error:', error);
    throw error;
  }
}
