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
        craft()->templates->includeJsResource('scrawl/js/marked.js');
        craft()->templates->includeJsResource('scrawl/js/codemirror/codemirror.js');
        craft()->templates->includeJsResource('scrawl/js/codemirror/markdown.js');
        
        craft()->templates->includeCssResource('scrawl/css/scrawl.css');

        return craft()->templates->render('scrawl/markdown', array(
            'name'     => $name,
            'value'    => $value
        ));
    }
}