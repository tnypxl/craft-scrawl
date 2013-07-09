<?php

/**
 * Scrawl is a simple markdown plugin for Craft CMS providing a fieldtype and a twig filter.
 *
 * @package   Craft Scrawl
 * @author    Mario Friz
 */

namespace Craft;

class ScrawlPlugin extends BasePlugin
{
    public function getName()
    {
        return Craft::t('Scrawl');
    }

    public function getVersion()
    {
        return '0.9.1';
    }

    public function getDeveloper()
    {
        return 'Mario Friz';
    }

    public function getDeveloperUrl()
    {
        return 'http://builtbysplash.com';
    }

    /**
     * Load the MarkdownTwigExtension class from our ./twigextensions
     * directory and return the extension into the template layer
     * 
     * Original Blocks markdown plugin by Jamie Rumbelow <http://jamierumbelow.net> 
     * @link https://github.com/jamierumbelow/blocks.markdown
     *
     * Adapted to Craft by Nathan Doyle <http://natetronn.com> 
     * @link https://github.com/Natetronn/craft.markdown
     */
    public function hookAddTwigExtension()
    {
        Craft::import('plugins.scrawl.twigextensions.MarkdownTwigExtension');
        return new MarkdownTwigExtension();
    }
}