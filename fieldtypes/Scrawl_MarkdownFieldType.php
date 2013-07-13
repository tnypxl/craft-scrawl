<?php

/**
 * Scrawl is a simple markdown plugin for Craft CMS providing a fieldtype and a twig filter.
 *
 * @package   Craft Scrawl
 * @author    Mario Friz
 */

namespace Craft;

class Scrawl_MarkdownFieldType extends BaseFieldType
{
    /**
     * Returns the type of field this is.
     *
     * @return string
     */
    public function getName()
    {
        return Craft::t('Markdown');
    }

    /**
     * Returns the content attribute config.
     *
     * @return mixed
     */
    public function defineContentAttribute()
    {
        return array(AttributeType::String, 'column' => ColumnType::Text);
    }

    /**
     * Returns the field's input HTML.
     *
     * @param string $name
     * @param mixed  $value
     * @return string
     */
    public function getInputHtml($name, $value)
    {        
        if (ScrawlPlugin::$devMode === false) {
            // Include compiled css and js in production mode
            craft()->templates->includeJsResource('scrawl/min/scrawl.js');
            craft()->templates->includeCssResource('scrawl/min/scrawl.css');
        }
        else {
            // Include markdown parser for preview
            craft()->templates->includeJsResource('scrawl/js/marked.js');

            // Load up codemirror
            craft()->templates->includeJsResource('scrawl/js/codemirror/codemirror.js');

            // Include the html and markdown language mode
            craft()->templates->includeJsResource('scrawl/js/modes/xml.js');
            craft()->templates->includeJsResource('scrawl/js/modes/markdown.js');

            // Load custom JS
            craft()->templates->includeJsResource('scrawl/js/scrawl.js');

            // Load css
            craft()->templates->includeCssResource('scrawl/css/scrawl.css');
            craft()->templates->includeCssResource('scrawl/css/preview.css');
        }

        return craft()->templates->render('scrawl/input', array(
            'name'     => $name,
            'value'    => $value,
        ));
    }
}